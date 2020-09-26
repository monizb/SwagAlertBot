const nodemailer = require('nodemailer');
const config = require('./config');
const firebase = require('firebase');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'monish2.basaniwal@gmail.com',
        pass: 'ttzdhmzthhlhhlqv'
    }
});

var today = new Date();
var dd = String(today.getDate() + 1).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var dbdate = dd + mm + yyyy;
var opp_list = "<h4>Good Morning!These are some of the potential tweets which I think will get you some awesome swag!</h4><br>";

const mailOptions = {
    from: 'Monish Basaniwal <monish2.basaniwal@gmail.com>',
    to: 'monish2.basaniwal@gmail.com',
    subject: 'Swag Opportunities From Yesterday Have Arrived!',
    html: ''
}

function sendMail() {
    firebase.database().ref("/swagbot/" + dbdate).once('value').then(function (snapshot) {
        for (var opp in snapshot.val()) {
            opp_list += '<p>' + snapshot.val()[opp].link + "</p><br>"
        }
        mailOptions.html = opp_list
        transporter.sendMail(mailOptions, (erro, info) => {
            process.exit(0);
        });
    })
}

sendMail();

