// Load required modules
const http    = require("http");              // http server core module
const https   = require("https");     // https server core module
const fs = require("fs");
var express = require("express");           // web framework external module
let forceSsl = require('express-force-ssl');
var serveStatic = require('serve-static');  // serve static files
let socketIo = require("socket.io");        // web socket external module
var easyrtc = require("../index");               // EasyRTC external module
let request = require('request');
const configs = require("./configs/configs");
let env = require('node-env-file');
env(__dirname + '/.env');
var bodyParser = require('body-parser');
var cors = require('cors');
var roomModel = require("./app/models/room.model");
var path = require("path");


const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.PORT || 8000;
let rest = [];
let dir1, dir2;

let prod = parseInt(process.env.PROD);

if (prod) {
    console.log('Production Enabled');
} else {
    console.log("Development Enabled");
}

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());

//Disbale forceSsl in dev
//app.use(forceSsl);
//app.use(serveStatic('static', {'index': 'grr-ui/build/index.html'}));
app.use(express.static(__dirname + "/../grr-ui/build/https/", {dotfiles:'allow'}));
app.use(express.static(__dirname + "/../grr-ui/build/https2/", {dotfiles:'allow'}));
app.use(express.static(__dirname + "/../grr-ui/build/", {dotfiles:'allow'}));
app.use('/images', express.static(__dirname + "/../grr-server/uploads/"));

require('./app/routes/room.routes')(app);
require('./app/routes/interview.routes')(app);
require('./app/routes/asset.routes')(app);

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/../grr-ui/build/index.html'), function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
})


let httpServer = http.createServer(app);

let options, socketServer, secureServer;

if (prod) { 
    options = {
        key:  fs.readFileSync(configs.https.key),
        cert: fs.readFileSync(configs.https.cert)
    }

    secureServer = https.createServer( options, app);
    socketServer = socketIo.listen(secureServer, {"log level":1});
} else {
    socketServer = socketIo.listen(httpServer, {"log level":1});
}
// Start Express http server on port 8080
//var webServer = http.createServer(app);


// Start Socket.io so it attaches itself to Express server


easyrtc.setOption("logLevel", "debug");


easyrtc.on("getIceConfig", request.bind(this, configs.request, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        let info = JSON.parse(body);
        console.log(info.v.iceServers);
        easyrtc.setOption('appIceServers', info.v.iceServers);
      }
}));


// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        console.log("hiiiiiiii");
        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

easyrtc.events.on("msgTypeGetRoomList", function (connectionObj, socketCallback, next) {
    easyrtc.util.logDebug("getRoomList received from client! Checking GRR DB to find rooms");
    let appObj = connectionObj.getApp();
    roomModel.find(function (err, rooms) {
        if(err) {
            easyrtc.util.logDebug("Unable to retrieve existing rooms from GRR database");
            // TODO: Send socket.io message back to client explaining error.
            return;
        }

        else {
            connectionObj.generateRoomList(function (error, roomList) {
                if (error) {
                    easyrtc.util.logDebug("Unable to retrieve existing EasyRTCServer rooms.");
                    // TODO: Send socket.io message back to client explaining error.
                    return;
                }

                else {
                    let existingRooms = Object.keys(roomList);
                    rooms.forEach(function (room) {
                        if (!existingRooms.includes(room['name'])) {
                            easyrtc.util.logDebug("Room '" + room['name'] +"' does not exist. Attempting creation.");
                            appObj.createRoom(room['name'], null, function (err, roomObj) {
                                if (err) {
                                    easyrtc.util.logDebug("Unable to create room");
                                }
                                else {
                                    existingRooms.push(room['name']);
                                    console.log(existingRooms);
                                }
                            });
                        }

                        else {
                            easyrtc.util.logDebug("Room '"+ room['name'] + "' exists. Doing nothing.");
                        }
                    });

                    connectionObj.generateRoomList(function (err, roomList) {
                        easyrtc.util.sendSocketCallbackMsg(connectionObj.getEasyrtcid(), socketCallback,{"msgType": "roomList", "msgData":{"roomList":roomList}}, appObj);
                    });
                }
            });
        }
    });
});

easyrtc.events.on("msgTypeRoomJoin", function (connectionObj, rooms, socketCallback, next) {
    easyrtc.util.logDebug("msgTypeRoomJoin received from client!");
    var appObj = connectionObj.getApp();
    var roomObject = rooms[Object.keys(rooms)[0]];
    console.log(roomObject);

    if(roomObject['roomParameter']['joinOnCompletion']) {
        easyrtc.util.logDebug("Trying to join existing room! Calling roomJoin for room '" + roomObject['roomName'] + "'");
        appObj.events.defaultListeners.roomJoin(connectionObj, roomObject['roomName'], null, next);
        easyrtc.util.sendSocketCallbackMsg(connectionObj.getEasyrtcid(), socketCallback, {"msgType": "roomData", "msgData": {}}, appObj);
    }

    roomModel.findOne({'name': roomObject['roomName']}, function (err, room) {
        if (err) {
            console.log(err);
            if(err.kind === 'ObjectId') {
                easyrtc.util.logDebug("Cannot find room. Attempting to create");
                appObj.createRoom(roomObject['roomName'], null, function (err, roomObj) {
                    if (err) {

                    }

                    else {
                        easyrtc.util.sendSocketCallbackMsg(connectionObj.getEasyrtcid(), socketCallback, {"msgType": "roomData", "msgData":{"roomData": roomObj.toString()}}, appObj);
                    }
                });
            }
        }

        if (!room) {
            easyrtc.util.logDebug("Room object false. Attempting to create ");
            appObj.createRoom(roomObject['roomName'], null, function (err, roomObj) {
                if (err) {

                }

                if(roomObject['roomParameter']['joinOnCompletion']) {
                    appObj.events.defaultListeners.roomJoin(connectionObj, roomObject['roomName'], null, next);
                }
                else {
                    var roomName = roomObject['roomName'];
                    var roomDataobj = {
                        roomName : {
                            "roomName": roomName
                        }
                    };

                    easyrtc.util.sendSocketCallbackMsg(connectionObj.getEasyrtcid(), socketCallback, {"msgType": "roomData", "msgData":{"roomData": roomDataobj}}, appObj);
                }
            });
        }

        // room exists in GRR DB so check to see if it exists in EasyRTC Server
        // if yes, join if joinOnCompletion is true
        //      otherwise (joinOnCompletion is false),  stop and send message back to client
        // if no, create (and join) if joinOnCompletion is true
        //      otherwise (joinOnCompletion is false),  stop and send message back to client


    });
});

easyrtc.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    easyrtc.util.logDebug("roomCreate fired! Checking GRR DB for room: " + roomName);
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    easyrtc.util.logDebug("roomJoin fired! Attempting to join room");
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
const rtcServer = easyrtc.listen(app, socketServer, {logLevel:"debug", logDateEnable:true, logMessagesEnable: true, demosEnable: false, appAutoCreateEnable: false, roomDefaultEnable: false, appDefaultName: 'GameRoomRecruiting'}, function(err, rtcRef) {

    console.log("Initiated");
    rtcRef.app(null, function (err, appObj) {});

    //listen on PORT
    if (prod) {
        secureServer.listen(HTTPS_PORT, function () {
            console.log(`setup HTTPS Server`);
        });
    }

    httpServer.listen(HTTP_PORT, function() {
        console.log(`Setup HTTP Server`);
    });
});