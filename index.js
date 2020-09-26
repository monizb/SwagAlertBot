const API = require('./api-functions');
const config = require('./config');
const firebase = require("firebase");
const axios = require("axios");
const bad = [];
/** @class ContestJSBot */
class ContestJSBot {

    constructor() {
        this.last_tweet_id = 0;
        this.searchResultsArr = [];
        this.blockedUsers = [];
        this.badTweetIds = [];
        this.limitLockout = false;
    }

    /** Start the bot */
    start() {
        var comp = this;
        API.getBlockedUsers()
            .then(blockedList => {
                comp.blockedUsers = Object.assign([], blockedList);

                // Start searching (the Search is in itself a worker, as the callback continues to fetch data)
                comp.search();

                // Start the Retweet worker after short grace period for search results to come in
                setTimeout(() => comp.worker(), config.SHORT_TIMER);
            })
            .catch(err => console.error('Your credentials are not valid. Check the config.js file and ensure you supply the correct API keys.', err));
        // Begin the program by fetching the blocked users list for the current user
    }

    /** The Search function */
    search() {
        // Don't search if limit lockout is in effect
        if (this.limitLockout) return;

        const since_id = this.last_tweet_id;
        const result_type = config.RESULT_TYPE;
        const geocode = config.SEARCH_BY_GEOCODE;
        console.log('[Search] Searching for tweets...');

        let doSearch = (index) => {
            // Construct the query
            let text = config.SEARCH_QUERIES[index] + config.SEARCH_QUERY_FILTERS;

            // Append preferred accounts if it's the case
            if (config.PREFERRED_ACCOUNTS) {
                text += ` from:${config.PREFERRED_ACCOUNTS.join(' OR from:')}`;
            }

            API.search({ text, result_type, since_id, geocode })
                .then(res => {
                    // Call the search callback to process the data
                    this.searchCallback(res);

                    if (config.SEARCH_QUERIES[index + 1]) {
                        // Sleep between searches so we do not trigger rate limit lockout
                        console.log(`[Search] Sleeping for ${config.RATE_SEARCH_TIMEOUT / 1000} seconds between searches so we don't trigger rate limit`);
                        setTimeout(() => doSearch(++index), config.RATE_SEARCH_TIMEOUT);
                    }
                })
                .catch(err => this.errorHandler(err));
        };

        doSearch(0);
    }

    /**
     * The Callback function for the Search API.
     * Filters bad tweets and constructs the array of tweets that we want to pass further to the worker.
     */
    searchCallback(tweets) {

        // Iterate through tweets returned by the Search
        tweets.forEach(tweet => {

            // Lots of checks to filter out bad tweets, other bots and contests that are likely not legitimate :
            // If it's not already a retweet
            if (tweet.retweeted_status || tweet.quoted_status_id) return;

            // It's not an ignored tweet
            if (this.badTweetIds.indexOf(tweet.id) > -1) return;

            // Has enough retweets on the tweet for us to retweet it too (helps prove legitimacy)
            if (tweet.retweet_count < config.MIN_RETWEETS_NEEDED) return;

            // User is not on our blocked list
            if (this.blockedUsers.indexOf(tweet.user.id) > -1) return;

            // It doesn't contain phrases that we don't want
            if (config.POST_SEARCH_FILTERS.length) {
                let containsBlockedPhrases = false;
                config.POST_SEARCH_FILTERS.forEach(phrase => {
                    if (tweet.text.indexOf(phrase) > -1) {
                        containsBlockedPhrases = true;
                        return false;
                    }
                });
                if (containsBlockedPhrases) return;
            }

            // We ignore users with high amounts of tweets (likely bots)
            if (config.MAX_USER_TWEETS && tweet.user.statuses_count >= config.MAX_USER_TWEETS) {
                // may be a spam bot, do we want to block them?
                if (config.MAX_USER_TWEETS_BLOCK) {
                    this.blockedUsers.push(tweet.user.id);
                    API.blockUser(tweet.user.id)
                        .then(() => console.log('Blocked possible bot user' + tweet.user.id));
                }
                return;
            }

            // Save the search item in the Search Results array
            this.searchResultsArr.push(tweet);
        });
    }

    /** The error callback for the Search API */
    errorHandler(err) {
        console.error('[Error]', err);

        try {
            // If the error is 'Rate limit exceeded', code 88 - try again after 10 minutes
            if (JSON.parse(err.error).errors[0].code === 88) {
                console.log('After ' + config.RATE_LIMIT_EXCEEDED_TIMEOUT / 60000 + ' minutes, I will try again to fetch some results...');

                this.limitLockout = true; // suspend other functions from running while lockout is in effect

                // Queue resume of program by setting the lockout to false
                setTimeout(() => this.limitLockout = false, config.RATE_LIMIT_EXCEEDED_TIMEOUT);
            }
        }
        catch (err) {
            console.log('[Error]', err);
        }
    }


    /**
     * The worker starts by Retweeting a tweet.
     * If it finds necessary it also likes (favorites) it and follows the user.
     */
    worker() {
        var comp = this;
        // Check if we have elements in the Result Array
        if (this.searchResultsArr.length) {
            // Pop the first element (by doing a shift() operation)
            var searchItem = this.searchResultsArr[0];
            this.searchResultsArr.shift();
            var today = new Date();
            var dd = String(today.getDate() + 1).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            var date = dd + mm + yyyy
            // Retweet
            firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).set({ link: "https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str }).then(res => {
                console.log("Saved Tweet " + ("https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str));

                firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).once('value').then(function (snapshot) {
                    var settings = {
                        "chat_id": '-1001317978329',
                        "text": "Beep Bop! 🤖 Found a potential swag related tweet here: https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str
                    }

                    if (snapshot.val().status !== "Sent") {
                        axios.post("https://api.telegram.org/bot1087328818:AAEUner3avOW95hv3i9Tb67n1hFp-i4J3hQ/sendMessage", settings).then(res => {
                            firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).update({ status: "Sent" }).then(res => {
                                console.log("Message Sent To Telegram, Now Sleeping For 4 Minutes");
                                setTimeout(() => this.worker(), config.RETWEET_TIMEOUT);
                            }).catch(err => {
                                console.log(err);
                            })
                        })

                    } else {
                        console.log("Message Already Exists, Now Sleeping For 5 Minutes");
                        setTimeout(() => this.worker(), config.RETWEET_TIMEOUT);
                    }
                })
            })

        }

        // No search results left in array
        else {
            if (this.limitLockout) {
                // we must schedule this to rerun, or else the program will exit when a lockout occurs
                setTimeout(() => this.worker(), config.RATE_SEARCH_TIMEOUT);
                return;
            }

            console.log('No more results. Will search and analyze again in ', config.RATE_SEARCH_TIMEOUT / 1000 + ' seconds.');

            // go fetch new results
            setTimeout(() => this.worker(), config.RATE_SEARCH_TIMEOUT);
            setTimeout(() => this.search(), config.RATE_SEARCH_TIMEOUT);

        }
    }
}

// Start the bot
new ContestJSBot().start();
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log(bad.length + " new Tweet Ids Blacklisted");
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
