const firebase = require('firebase');

const config = {

    /* These are your twitter developer authentication details. Get them at https://apps.twitter.com/ */
    auth: {
        consumer_key: 'rLOPTWJ4tMeUDh88HYbRy5Wx5',
        consumer_secret: 'rVGsNslvDTYkUVtYkPLpD3oZfdJbLKyvnnNO6CckS0O18BzLfx',
        token: '947909458167980032-SesCuKBtTod5710t9Gvoln3ofgTy4Gq',
        token_secret: 'HIvkwkvHSzhozDgoUyTRMN92BIMs91esmacZOHBzzfMPY'
    },

    // The searches the bot will do
    SEARCH_QUERIES: [
        "#rttowin",
        "win rt",
        "#giveawayalert retweet win",
        "rt for your chance to win",
        "retweet and you could win",
        "#sweepstakes -gun",
        "#giveaway retweet",
        "Retweet and win",
        'retweet to win',
        'RT to win',
        'retweet 2 win',
        'RT 2 win'
    ],

    // Appended at the end of search queries to filter out some data
    SEARCH_QUERY_FILTERS: ' -vote -filter:retweets',

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
    // - Significantly reduces the amount of fake contests retweeted and stops
    //    retweeting other bots that retweet retweets of other bots.
    // Default: 10
    MIN_RETWEETS_NEEDED: 0,

    // Maximum amount of tweets a user can have before we do not retweet them.
    // - Accounts with an extremely large amount of tweets are often bots,
    //    therefore we should ignore them and not retweet their tweets.
    // Default: 20000
    //          0 (disables)
    MAX_USER_TWEETS: 20000,

    // If option above is enabled, allow us to block them.
    // - Blocking users do not prevent their tweets from appearing in search,
    //    but this will ensure you do not accidentally retweet them still.
    // Default: false
    //          true (will block user)
    MAX_USER_TWEETS_BLOCK: false,

    // 10 minutes timeout for limit exceeded
    RATE_LIMIT_EXCEEDED_TIMEOUT: 1000 * 60 * 10,

    // 15 seconds timeout for Retweets
    RETWEET_TIMEOUT: 1000 * 10,

    // 30 seconds for Search Timeout
    RATE_SEARCH_TIMEOUT: 1000 * 30,

    // Array of preferred accounts. If set, it only filters tweets from these accounts. Example: ['user1', 'user2']
    PREFERRED_ACCOUNTS: []
};

var firebaseConfig = {
    apiKey: "AIzaSyAd6F-IQb4c6KHNgqjjweY-ZJM8loFAh98",
    authDomain: "twitter-contest-bot.firebaseapp.com",
    databaseURL: "https://twitter-contest-bot.firebaseio.com",
    projectId: "twitter-contest-bot",
    storageBucket: "twitter-contest-bot.appspot.com",
    messagingSenderId: "692286032202",
    appId: "1:692286032202:web:3e511f8b1a1d70f04b19b3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

module.exports = config, firebaseConfig;