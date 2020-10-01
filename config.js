/* The File Which Can Control the Amount Of Swag which you will get */

const firebase = require('firebase'); //Get Firebase Instance to Initialize the DB
const keys = require("./keys");

const config = {

    /* These are your twitter developer authentication details. Get them at https://apps.twitter.com/ */
    auth: {
        consumer_key: keys.CONSUMER_KEY,
        consumer_secret: keys.CONSUMER_SECRET,
        token: keys.ACCESS_TOKEN,
        token_secret: keys.ACCESS_TOKEN_SECRET
    },

    // The searches the bot will do

    /*Heart of the program Better Keywords = More Swag */
    SEARCH_QUERIES: [
        "win free swag",
        "#swag win",
        "free swag",
        "\"win free swag\"",
        "#ContestAlert swag OR #Contest swag",
        "\"free swag\" contest",
        "give away",
        "#giveaway",
        "gratis",
        "#gratis",

    ],
    /////////////////////////////////////////////////////////

    // Appended at the end of search queries to filter out some data (We dont want tweets which are retweets or replies)
    SEARCH_QUERY_FILTERS: '-filter:retweets -filter:replies',

    // Filter out tweets containing any phrases you want - just add them as strings in the array
    POST_SEARCH_FILTERS: [],

    // Allow searching by location. A Valid geocode has the form "lat long radius_in_miles"
    // Example: '37.781157 -122.398720 1mi'
    SEARCH_BY_GEOCODE: '',

    // 'Specifies what type of search results you would prefer to receive. The current default is “mixed.” Valid values include:'
    // Default: 'recent'   (return only the most recent results in the response)
    //          'mixed'    (Include both popular and real time results in the response)
    //          'popular'  (return only the most popular results in the response)
    RESULT_TYPE: 'recent',

    // Minimum amount of retweets a tweet needs before we retweet it.
    // - Significantly reduces the amount of fake contests and stops
    //    retweeting other bots that retweet retweets of other bots.
    // Default: 0
    MIN_RETWEETS_NEEDED: 0,

    // Maximum amount of tweets a user can have before we do not retweet them.
    // - Accounts with an extremely large amount of tweets are often bots,
    //    therefore we should ignore them and not retweet their tweets.
    // Default: 20000
    //          0 (disables)
    MAX_USER_TWEETS: 20000,

    // When we detect another Bot ,If option below is enabled, allow us to block them.
    // - Blocking users do not prevent their tweets from appearing in search,
    //    but this will ensure you do not accidentally retweet them still.
    // Default: false
    //          true (will block user)
    MAX_USER_TWEETS_BLOCK: false,

    // 10 minutes timeout for rate limit exceeded
    RATE_LIMIT_EXCEEDED_TIMEOUT: 1000 * 60 * 10,

    // 5 minute timeout between sending messages
    MESSAGE_TIMEOUT: 1000 * 60 * 5,

    //Grace Timer
    SHORT_TIMER: 1000 * 15,

    // 120 seconds for Search Timeout
    RATE_SEARCH_TIMEOUT: 1000 * 60 * 2,

    //One Hour Timer (Deprecated)
    HOURLY_TIMEOUT: 1000 * 60 * 60,

    // Array of preferred accounts. If set, it only filters tweets from these accounts. Example: ['user1', 'user2']
    PREFERRED_ACCOUNTS: []
};

/* Define The Firebase Service Configs */
var firebaseConfig = {
    apiKey: keys.F_API,
    authDomain: keys.F_AUTH_DOMAIN,
    databaseURL: keys.F_DB_URL,
    projectId: keys.F_P_ID,
    storageBucket: keys.F_STOR_BUCK,
    messagingSenderId: keys.F_SENDER_ID,
    appId: keys.F_APP_ID
};
/////////////////////////////////////////////////////////

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

module.exports = config, firebaseConfig; //Export All The Good Stuff
