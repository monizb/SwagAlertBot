/* Getting Required Modules */
const keys = require("./keys");
const API = require('./api-functions'); //Getting Our API Functions
const config = require('./config'); //GEtting Config Variables
const firebase = require("firebase"); //The Database
const axios = require("axios"); //Used to send messages to Telegram
/////////////////////////////////////////////////////////

const bad = []; //Another instance of our Trash Can :P
/** @class SwagAlertBot */

class SwagAlertBot {

    constructor() {
        /* Setting Up Some Required Variables */
        this.last_tweet_id = 0; // Used to search from this tweet id to next, Refer Twitter Docs
        this.searchResultsArr = []; // Holds Our Search Results
        this.blockedUsers = []; // Holds The List Of Blocked People From Our Account
        this.badTweetIds = []; //Pushes used tweet IDs into this
        this.limitLockout = false; // Signals if rate limit has been reached to make the bot sleep temporarily
        /////////////////////////////////////////////////////////
    }

    /** Start the bot */
    start() {
        var comp = this;
        API.getBlockedUsers() //Get my blocked users
            .then(blockedList => {
                comp.blockedUsers = Object.assign([], blockedList);//Assing the blocked people to the array above

                // Start searching (the Search is in itself a worker, as the callback continues to fetch data)
                comp.search();

                // Start the Message Sender worker after short grace period for search results to come in
                setTimeout(() => comp.worker(), config.SHORT_TIMER);
            })
            .catch(err => console.error('Your credentials are not valid. Check the config.js file and ensure you supply the correct API keys.', err));
    }

    /** The Search function */
    search() {
        // Don't search if limit lockout is in effect
        if (this.limitLockout) return;

        const since_id = this.last_tweet_id; //Not really used
        const result_type = config.RESULT_TYPE; // The result type we chose in the config file
        const geocode = config.SEARCH_BY_GEOCODE; //If you want to search Within a specific location

        console.log('[Search] Searching for tweets...');

        let doSearch = (index) => {
            // Construct the query
            let text = config.SEARCH_QUERIES[index] + config.SEARCH_QUERY_FILTERS;

            // Append preferred accounts if it's the case
            if (config.PREFERRED_ACCOUNTS) {
                text += ` from:${config.PREFERRED_ACCOUNTS.join(' OR from:')}`;
            }

            API.search({ text, result_type, since_id, geocode }) //Search
                .then(res => {
                    // Call the search callback to process the data
                    this.searchCallback(res);

                    if (config.SEARCH_QUERIES[index + 1]) {
                        // Sleep between searches so we do not trigger rate limit lockout
                        console.log(`[Search] Sleeping for ${config.RATE_SEARCH_TIMEOUT / 1000} seconds between searches so we don't trigger rate limit`);
                        setTimeout(() => doSearch(++index), config.RATE_SEARCH_TIMEOUT); //Timeout the search
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

            // Lots of checks to filter out bad tweets, other bots and swag opportunities that are likely not legitimate :
            // If it's not already a retweet
            if (tweet.retweeted_status || tweet.quoted_status_id) return;

            // It's not an ignored tweet from our trash can
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
            /* Get tomorrow's Date */
            var today = new Date();
            var dd = String(today.getDate() + 1).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            var date = dd + mm + yyyy
            /////////////////////////////////////////////////////////

            // First Check If This Message Has Already been sent to Telegram
            firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).once('value').then(function (snap) {
                if (snap.val() === null) { //If Not
                    //Save this link to the DB
                    firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).set({ link: "https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str, status: 'Unsent' }).then(res => {
                        console.log("Saved Tweet " + ("https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str));
                        //Again checks if it has been previously sent to Telegram
                        firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).once('value').then(function (snapshot) {
                            var settings = {
                                "chat_id": keys.CHAT_ID, //The Chat ID to be sent to

                                //Choose Between The Two Texts Randomly
                                "text": ~~(Math.random() * 2) ? "Beep Bop! 🤖 Found a potential swag related tweet here: https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str : "Its Swag Time! 🥳 🎉  Found a potential swag related tweet here: https://twitter.com/" + searchItem.user.id_str + "/status/" + searchItem.id_str
                            }

                            if (snapshot.val().status === "Unsent") {
                                //Send The message to the Channel
                                axios.post("https://api.telegram.org/" + keys.BOT_ID + "/sendMessage", settings).then(res => {
                                    firebase.database().ref("/swagbot/" + date + "/" + searchItem.id_str).update({ status: "Sent" }).then(res => {
                                        //Add Tweet Id to trash can XD
                                        comp.badTweetIds.push(searchItem.id);
                                        console.log("Message Sent To Telegram, Now Sleeping For" + config.MESSAGE_TIMEOUT / 1000 + "Seconds");
                                        setTimeout(() => comp.worker(), config.MESSAGE_TIMEOUT);
                                    }).catch(err => {
                                        console.log(err);
                                    })
                                })

                            } else {
                                //Message Had Already Been Sent
                                console.log("Message Already Exists, Now Sleeping For 5 Minutes");
                                setTimeout(() => comp.worker(), config.RETWEET_TIMEOUT);
                            }
                        })
                    })
                } else {
                    //No Timeout Needed, Restart
                    comp.worker()
                }
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
new SwagAlertBot().start();

/* This whole part is only for local  development (No harm even when pushed to production though) Makes the program do something before it exits out
when you use Ctrl+C */

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
/////////////////////////////////////////////////////////
