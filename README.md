<p align="center">
<img src="https://firebasestorage.googleapis.com/v0/b/trello-87674.appspot.com/o/Blue%20and%20White%20Gaming%20Logo%20(2).png?alt=media&token=ee2951b0-f07c-47f1-9984-61a41a91de57" width="150"/>
 </p>
 <br>
 <br>
 
 ![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)
 ![License](https://img.shields.io/github/license/monizb/SwagAlertBot)
 ![Issues](https://img.shields.io/github/issues/monizb/SwagAlertBot)
 
 # Swag Alert Bot
 A Twitter Bot that scans Tweets for potential free swag offers and sends the Tweet right to your Telegram Inbox! It also sends an email every morning at a specified time, aggregating the previous day's offers it found.
 
 ### Installation
 This project has the following requirements:
 - Node.JS
 - NPM
 - Twitter Developer Account (Apply for one [here](https://developer.twitter.com/en/apply-for-access))
 - Telegram Account (With a channel preferably)
 - Firebase account with a Realtime DB created
 - Email account with app Password (Gmail preferably)
 - Heroku Account (To host the bot)
 
Start by creating a new app on your Twitter Developer Account and name it whatever you want after which it should provide you with these keys:

```
API_KEY
API_KEY_SECRET
ACESS_TOKEN
ACCESS_TOKEN_SECRET
```

`Store these keys in a safe place or you will have to regenarate them.`

Next Clone this repository and cd into it and install all require dependencies:

```sh
$ git clone https://github.com/monizb/SwagAlertBot.git
$ cd SwagAlertBot-master
$ npm install
```

Next Rename `keys.sample` file to `keys.js`. This is where you will store all
the important variables required by the bot.

These are the variables present inside the `keys.js` file:

```
MAIL_ID: //Place your email id using which the bot will send an email
MAIL_PASS: //Place your Gmail App Password here
MAIL_FROM: //The from name (Ex: Swag Alert Bot <swagalertbot@testmail.com>)
MAIL_TO: //The email to which the email has to be sent
CONSUMER_KEY: // Your Twitter API Keys
CONSUMER_SECRET: // Twitter API Key Secret
ACCESS_TOKEN: // Twitter Access Token
ACCESS_TOKEN_SECRET: //Twitter Access Token Secret
F_API: // Firebase API Key
F_AUTH_DOMAIN: //Firebase Auth Domain
F_DB_URL: //Firebase DB Url
F_P_ID: //Firebase Project ID
F_SENDER_ID: //Firebase Message Sender ID
F_APP_ID: //Firebase App ID
BOT_ID: //Bot token which you get from @BotFather on Telegram
CHAT_ID: //The Chat ID to which the message should be sent
```

Process to get the Chat ID:

1. Create your Bot by using `@BotFather` on Telegram and save the token it
   provides you with
2. Create a Group or a Broadcast where you wish the Bot to send the tweets and
   add the Bot you just created in the previous step to the same group
3. Send any message mentioning your bot using `@`
4. Next use any Browser or Postman and send a request to
   `https://api.telegram.org/bot<YourBOTToken>/getUpdates` You will then get a
   JSON response if your token is correct. The bot token should start with
   `bot<token>`
5. In the JSON look for `chat` object, there you should find the `id` of the
   group you just sent the message to

After you have completed the `keys.js` file, open the `config.js` file which
contains values with which you can tweak the working of your bot.

These values are included within the `config.js` file:

- **SEARCH_QUERIES** - The Query Keywords which the bot will search for (Very
  Important)
- **SEARCH_QUERY_FILTERS** - These queries are added at the end of each search
  to filter out the tweets we dont require. By deafult it filters out retweets
  and reply-tweets
- **SEARCH_BY_GEOCODE** - Setting the geocode enables you to search for tweets
  within a given geographical loction
- **POST_SEARCH_FILTERS** - An array containing the words which you do not want
  to be a part of the search (Each keyword should be preceded by `-`)
- **RESULT_TYPE** - Specifies the kind of results you want (3 correct options:
  `recent`,`popular` or `mixed`)
- **MIN_RETWEETS_NEEDED** - Minimum amount of retweets a tweet should have
  before which our Bot decides to send it (Reduces Fake Offers)
- **MAX_USER_TWEETS** - Maximum amount of tweets a user can have before the bot
  doesnt include them in the collection
- **MAX_USER_TWEETS_BLOCK** - Block the users which the Bot thinks are Bots too,
  this narrows down the search results again
- **RATE_LIMIT_EXCEEDED_TIMEOUT** - If the bot exceeds the `Rate Limit` set by
  Twitter, Stop the bot for this amount of time
- **MESSAGE_TIMEOUT** - Amount of time the bot should wait for before every
  message it sends out
- **SHORT_TIMER** - Grace timer for the results to come in
- **RATE_SEARCH_TIMEOUT** - The amount of time the bot should wait before each
  consecutive search it performs
- **PREFERRED_ACCOUNTS** - The array of accounts the bot should specifically
  look for, it will reject any other tweets from an account not included in the
  list

Finally, after you have completed the above steps and tweaked your bot
accordingly run:

```sh
$ node index.js
```

This should immediately start the bot and start searching for tweets and sending
them one by one to the specified group <br>

### Hosting The Bot

Running the bot on your local machine always is not ideal. So hosting your bot
on a Free Heroku Account is the best option

1. Create a new app on Heroku
2. Follow On-Screen instructions to push your code to Heroku's Repository
3. Since this is a `worker` and not a web app a Procfile is required, this file
   is already included in the root folder of this repository, this tells Heroku
   what to do when you push your code
4. When you push your code Heroku still considers it to be a web app, to change
   this goto `Resources Tab` and switch off `npm start` and enable
   `node index.js` as specfied by the Procfile

To get the bot to send you daily emails, follow these steps:

1. Still in the `Resources` tab navigate to the Add-ons section and Search for
   `Heroku Scheduler`
2. Add that add-on and then go into the management section and click on add new
   job
3. Choose the time at which you want the email to be sent everyday by selecting
   `Every Day At` (Time is in `UTC`) and in the command add
   `node mailresults.js` and click `Save` <br>

### Contributing

`Hacktoberfest Contributions Accepted 🥳🥳` Any and every contribution is
accepted. Anything you think will make the bot better and smater.You can choose
from the existing issues or raise a new one if required.

---

### Disclaimer

This Bot uses Twitter API V1.1 and is written for `educational purposes only`
and lies withing the use scope of the API , using the bot to spam people,
posting sexual content, or abusing the Twitter API will result in a
`permanent ban` of your Twitter Account. This bot `DOES NOT` in any form
manipulate the tweet data or engage with the tweets by
retweeting,commenting,liking or favoriting them. Look at these rules by Twitter
[here](https://help.twitter.com/en/rules-and-policies/platform-manipulation)

### if you like it please give it a ⭐
