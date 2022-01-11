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
const portSerial = new SerialPort("COM4")
SerialPort.baudRate = 9600
const parser = new Readline()
portSerial.pipe(parser)

// state of muenster
let state = ['passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive']
let lastState = ['passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive', 'passive']
let focusState = undefined
/* Serialport parser */
let lastMsg = undefined
parser.on('data', (data)=>{
  if(data != lastMsg || lastMsg === undefined){
    let msg  = JSON.parse(data.toString())
    console.log("SP_INCOMING_MSG: ", msg)

    // set state
    if(msg.towerBottomPieceActive === 1){
      if(lastState[0] === 'passive'){
        state[0] = 'focus'
      }
      else {
        state[0] = 'active'
      }
      lastState[0] = state[0]
    }
    else if(msg.towerBottomPieceActive === 0){
      state[0] = 'passive'
    }

    if(msg.towerTopPieceActive === 1){
      if(lastState[1] === 'passive'){
        state[1] = 'focus'
      }
      else {
        state[1] = 'active'
      }
    }
    else if(msg.towerTopPieceActive === 0){
      state[1] = 'passive'
    }

    // check focus
    focusState = false
    for(let i=0; i < state.length; i++){
      if(state[i]==='focus'){
        focusState = true
      }
    }
    console.log(focusState)
    if(focusState === false){
      for(let i = state.length; i >= 0; i--){
        if(state[i] === 'active'){
          state[i] = 'focus'
          break;
        }
      }
    }
    lastState = state

    io.emit('data', state)
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