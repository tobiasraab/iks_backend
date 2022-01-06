// Socket + Express
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

// Serial Monitor
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const port = new SerialPort("COM4")
SerialPort.baudRate = 9600
const parser = new Readline()
port.pipe(parser)

// state of muenster
let state = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active']

/* Serialport parser */
let lastMsg = undefined
parser.on('data', (data)=>{
  if(data != lastMsg || lastMsg === undefined){
    let msg  = JSON.parse(data.toString())
    console.log("SP_INCOMING_MSG: ", msg)
  }
  lastMsg = data
})

io.on('connection', () => {
    console.log('CLIENT_CONNECTED');

    io.emit('data', state)
});



server.listen(port, () => {
    console.log('listening on: ', port);
});