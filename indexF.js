// Derek Hong 2016
// McCree Facebook Messenger Bot (some dumb shit that needs to be cleaned and commented)
// with code from "Facebook Messenger Bot Tutorial" by Jerry Wang (github: jw84)

'use strict'

const mongoose = require ("mongoose"); // The reason for this demo.

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
process.env.MONGODB_URI

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } 
  else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var senderSchema = new mongoose.Schema({
  fbid: Number,
  timezoneOffset: Number
});

var SenderUser = mongoose.model('SenderUsers', senderSchema)





const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
  res.send("it's high noon")
})


const  verifyToken = process.env.FB_VERIFY_TOKEN

// for Facebook verification
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === verifyToken) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})


const token = process.env.FB_PAGE_TOKEN

function sendTextMessage(sender, text) {
  let messageData = { text:text }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendTextMessageList(sender, textList) {
  if (textList.length > 0) {
    let messageData = { text:textList[0] }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
          recipient: {id:sender},
          message: messageData,
        }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } 
      else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
      else {
        sendTextMessageList(sender, textList.slice(1))
      }
    })
  }
}

var citiesByTimezone = {
  12:['London, England', 'Liberia','Ghana', 'Iceland'],
  13:['Cape Verde'],
  14:['South Georgia and the South Sandwich Islands'],
  15:['Argentina', 'Uruguay', 'Brazil (Except the western states of Acre, Amazonas, Mato Grosso, Mato Grosso do Sul, Rondônia and Roraima; and offshore islands)'],
  16:['Halifax, Nova Scotia', 'Bolivia', 'Puerto Rico'],
  17:['NYC, NY, USA', 'Cuba', 'Peru', 'The Pingry School of Excellence and Honor'],
  18:['Chicago, IL, USA', 'Mexico City, Mexico', 'Costa Rica'],
  19:['Phoenix, AZ, USA', 'Alberta, Canada'],
  20:['Los Angeles, CA, USA', 'Idaho', 'Vancouver, BC, Canada'],
  21:['Anchorage, AK, USA'],
  22:['Honolulu, HI, USA'],
  23:['Niue, New Zealand'],
  0:['Fiji', 'Marshall Islands', 'Tuvalu'],
  1:['Norfolk Island, Australia', 'Vanuatu', 'Solomon Islands'],
  2:['Sydney, Australia', 'Jewish Autonomous Oblast, Far Eastern Federal District, Russia', 'Yap State, Federated States of Micronesia'],
  3:['Tokyo, Japan', 'Seoul, South Korea', 'Timor Leste'],
  4:['Beijing, China', 'Singapore', 'Mongolia (Eastern part, including Ulaanbaatar)'],
  5:['Christmas Island, Australia', 'Thailand', 'Mongolia (Western part, including Hovd)'],
  6:['Bangladesh', 'Bhutan'],
  7:['Heard Island and McDonald Islands', 'Maldives', 'Uzbekistan'],
  8:['Armenia', 'Oman', 'Ulyanovsk Oblast, Volga Federal District, Russia'],
  9:['Moscow, Russia', 'Bahrain', 'Kuwait', 'Kenya', 'Uganda'],
  10:['Athens, Greece', 'Botswana', 'Swaziland','ZIMBABWE'],
  11:['Berlin, Germany', 'Rome, Italy', 'Chad',' Nigeria']
}


app.post('/webhook/', function (req, res) {
  var date = new Date()
  var sender = req.body.entry[0].messaging[0].sender.id
  var tzOffset = null

  var query = SenderUser.findOne({'fbid':sender})

  query.exec(function(err, userData) {
    if (err) {
      console.log(err);
    }
    else if (!userData) {
      var newUser = new SenderUser({
        'fbid':sender,
        'timezoneOffset':null
      })
      newUser.save(function (err) {if (err) console.log ('Error on save!')});
      console.log('new sender: ' + sender)
      sendTextMessage(sender, "Looks like you're new here, partner.  If you need help, just ask \"help\", plain and simple.")
    }
    else {
      tzOffset = userData.timezoneOffset
      let messaging_events = req.body.entry[0].messaging
      for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        if (event.message && event.message.text) {
          let text = event.message.text.toLowerCase()
          var minutes = date.getMinutes()
          var hours = date.getHours()

          if ((text.includes('what time is it') || text == 'what') && minutes === 0 && ((12 - hours) - tzOffset - 1).mod(24) === 0) {
            sendTextMessage(sender, "IT'S HIGH NOON, YEEEEHAW!")
          }
          else if ((text.includes('what time is it') || text == 'what') && (minutes != 0 && ((12 - hours) - tzOffset - 1).mod(24) != 0)) {
            sendTextMessage(sender, "It ain't high noon yet, partner...")
          }
          else if (text.includes('forcehighnoon')) {
            sendTextMessage(sender, "IT'S HIGH NOON, YEEEEHAW!")
          }
          else if (text.includes('where is it high noon') || text == 'where') {
            var citiesPost = citiesByTimezone[hours]
            var citiesAnte = citiesByTimezone[(hours + 1).mod(24)]
            var post = minutes
            var ante = 60 - minutes
            var msgPost = "It was high noon in " + citiesPost[Math.floor(Math.random()*citiesPost.length)] + " just " + post + " minutes ago."
            var msgAnte = "It'll be high noon in " + citiesAnte[Math.floor(Math.random()*citiesAnte.length)] + ' in ' + ante + " minutes."

            var randCity = [msgPost, msgAnte]
            sendTextMessage(sender, randCity[Math.floor(Math.random()*randCity.length)])
          }
          else if (text.includes('when will it be high noon') || text == 'when') {
            if (tzOffset == null) {
              sendTextMessage(sender, "I'm not sure... Tell me your UTC timezone offset by replying:\n\n\"My UTC timezone offset is ###\"\n\nReplace ### with a two digit number to set or change your UTC timezone offset.  Be sure to include + or -, and lead with a 0 for values less than 10 (eg: 05).")
            }
            else {
              var h = ((12 - hours) - tzOffset - 1).mod(24)
              var m = 60 - minutes
              sendTextMessage(sender, "It'll be high noon where you are in " + h + " hours and " + m + " minutes.")
            }
          }
          else if (text.includes('my utc timezone offset is ') || text.substring(0,7) == 'offset ') {
            var offsetIndex = text.indexOf('my utc timezone offset is ') + 26
            var offset = parseInt(text.substring(offsetIndex, offsetIndex + 3))
            if (text.substring(0,7) == 'offset ') {
              offset = parseInt(text.substring(7, 10))
            }
            if (isNaN(offset)) {
              sendTextMessage(sender, "Looks like you mistyped your timezone offset.  Replace ### with a two digit number to set or change your UTC timezone offset.  Be sure to include + or -, and lead with a 0 for values less than 10 (eg: 05).")
            }
            else {
              SenderUser.findOneAndUpdate(query, {'timezoneOffset':offset}, function(err, doc) {
                if (err) console.log(err);
              });
              if (offset < 0) {
                sendTextMessage(sender, "Alright, I updated your UTC timezone offset to " + offset + '.')
              }
              else if (offset > 0) {
                sendTextMessage(sender, "Alright, I updated your UTC timezone offset to +" + offset + '.')
              }
              else {
                sendTextMessage(sender, "Alright, I updated your UTC timezone offset to ±" + offset + '.')
              }
            }
          }
          else if (text.includes('forget my utc timezone offset') || text == 'forget') {
            SenderUser.findOneAndUpdate(query, {'timezoneOffset':null}, function(err, doc) {
                if (err) console.log(err);
              });
            sendTextMessage(sender, "Alright, I've forgotten your UTC timezone offset.")
          }
          else if (text == "help") {
            var listMessages = [
              "what time is it\n>I tell you if it's high noon or not.\n\nwhere is it high noon\n>I tell you where it will be/has been high noon.\n\n-",
              "my utc timezone offset is ###\n>Replace ### with a two digit number to set or change your UTC timezone offset.  Be sure to include + or -, and lead with a 0 for values less than 10 (eg: 05).\n\n-",
              "when will it be high noon\n>I tell you when it'll be high noon where you are.\n\nforget my utc timezone offset\n>I forget your UTC timezone offset\n\nhelp\n>Display this message.\n\n-",
              "\n~~~SHORTHAND~~~\nUse the following words to make shorthand commands (replace ### as before):\n\nwhat\nwhere\noffset ###\nwhen\nforget"
            ]
            sendTextMessageList(sender, listMessages)
          }
        }
      }
    }
  })

  res.sendStatus(200)
})




