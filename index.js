const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
const port = 3001;

let state = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active']

io.on('connection', () => {
    console.log('CLIENT_CONNECTED');

    io.emit('data', state)
});



server.listen(port, () => {
    console.log('listening on: ', port);
});