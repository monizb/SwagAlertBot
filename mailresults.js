/* Import Required Modules */
const nodemailer = require('nodemailer');
const keys = require("./keys");
const firebase = require('firebase');

//////////////////////////////////////////////////////

/* Define a Transporter Responsible For Sending Aggregated Emails Every Morning */
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: keys.MAIL_ID,
        pass: keys.MAIL_PASS
    }
});
////////////////////////////////////////////////////////

/* Gets Todays Date To Be Used To Get The Content To Be Sent Out Today */
var today = new Date();
var dd = String(today.getDate() + 1).padStart(2, '0'); //Adds One To The Date To Get Tomorrow's Content
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var dbdate = dd + mm + yyyy;
/////////////////////////////////////////////////////////

/* Email's Header */
var opp_list = "<h4>Good Morning!These are some of the potential tweets which I think will get you some awesome swag!</h4><br>";
/////////////////////////////////////////////////////////

/* Email Configurations */
const mailOptions = {
    from: keys.MAIL_FROM,
    to: keys.MAIL_TO,
    subject: 'Swag Opportunities From Yesterday Have Arrived!',
    html: ''
}
/////////////////////////////////////////////////////////

/* The main function which sends out the Email */
function sendMail() {
    firebase.database().ref("/swagbot/" + dbdate).once('value').then(function (snapshot) {// Getting the content
        for (var opp in snapshot.val()) {
            opp_list += '<p>' + snapshot.val()[opp].link + "</p><br>"// Taking Each Link And Adding Some HTML
        }
        mailOptions.html = opp_list// Append The Link To The Main HTML
        transporter.sendMail(mailOptions, (erro, info) => {// Send The Mail
            process.exit(0); //Kill The Process And Wait For Next Day!
        });
    })
}
/////////////////////////////////////////////////////////

sendMail(); //Call The Mail Function

