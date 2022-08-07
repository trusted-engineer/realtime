// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

var randomColor = require('randomcolor'); // import the script

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');;
});

io.on('connection', (socket) => {
    //generate random name
    const shortName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals], // colors can be omitted here as not used
        length: 2,
        separator: "-"
      });
    //assign name to socket
    socket.data.username = shortName;
    // a hex code for an attractive color
    const color = randomColor(); 
    //assign name to socket
    socket.data.color = color;
    console.log(shortName+' connected with color code '+color);

    //announce connection
    const welcome = {
        type: "message",
        payload: shortName + " joined the chat!",
        name: "system",
        color: "#000000"
    }
    io.emit('chat message', welcome);

    socket.on('disconnect', () => {
      console.log(socket.data.username+' disconnected');
      const goodbye = {
        type: "message",
        payload: shortName + " left the chat :(",
        name: "system",
        color: "#000000"
      }
      io.emit('chat message', goodbye);
    });

    socket.on('chat message', (msg) => {
      console.log(socket.data.username+' wrote: ' + msg.payload);
      msg.name = socket.data.username;
      msg.color = socket.data.color;
      io.emit('chat message', msg);
    });
  });
  

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;

server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
// [END gae_node_request_example]

module.exports = app;
