#!/usr/bin/env node

/**********************
*                     *
*       SERVER        *
*                     *
**********************/

var express = require('express'),
    api = require('./routes/api'),
    bodyParser = require('body-parser'),
    //http = require('http'),
    https = require('https'),
    fs = require('fs');

var privateKey  = fs.readFileSync('/etc/letsencrypt/live/antoinedechassey.fr/privkey.pem', 'ascii');
var certificate = fs.readFileSync('/etc/letsencrypt/live/antoinedechassey.fr/cert.pem', 'ascii');
var chain = fs.readFileSync("/etc/letsencrypt/live/antoinedechassey.fr/chain.pem");

var credentials = {key: privateKey, cert: certificate, ca: chain};

var app = express();

//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.json());

app.get('/weathers', api.findAll);
app.get('/weathers/:id', api.findById);
app.post('/weathers', api.addWeather);
app.put('/weathers/:id', api.updateWeather);
app.delete('/weathers/:id', api.deleteWeather);

//httpServer.listen(3000);
httpsServer.listen(3443);

/**********************
*                     *
*         MQTT        *
*                     *
**********************/

var mqtt = require('mqtt');
var request = require('request');

var broker = 'mqtt://localhost';
var topic = 'home/weather';

var mqttClient  = mqtt.connect(broker);

mqttClient.on('connect', function () {
    mqttClient.publish(topic, 'MQTT server listening');
    mqttClient.subscribe(topic);
})

mqttClient.on('message', function (topic, message) {
    var payload = message.toString();
    console.log(payload);
    var payloadToStore = JSON.parse(payload);
    // Store the message with a MongoDB API
    var options = {
        uri: 'https://antoinedechassey.fr:3443/weathers',
        method: 'POST',
        json: {
            "temperature": payloadToStore.temperature,
            "time": new Date()
        }
    };

    request(options, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log(body) // Print the shortened url.
        } else {
            throw err;
        }
    });
    /* MongoClient.connect("mongodb://antoinedechassey.fr:27017/weather", function(error, db) {
        if (error){
            throw error;
        } else {
            console.log("Connected to database 'weather'");
            // Adding server time to the payload
            var payloadToStore = JSON.parse(payload);
            payloadToStore['time'] = new Date();

            db.collection("weathers").insert(payloadToStore, null, function (err, results) {
                if (err)
                    throw err;
                else
                    console.log("Weather inserted");    
            });
        }
    });*/
    //MqttClient.end()
})