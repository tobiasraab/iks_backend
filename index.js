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

    // set state of the pieces
    setState(msg.towerBottomPieceActive, 0)
    setState(msg.towerTopPieceActive, 1)

    // check wether there is a focused piece
    focusState = false
    for(let i=0; i < state.length; i++){
      if(state[i]==='focus'){
        focusState = true
      }
    }

    // if there is no focused piece => set one 
    if(focusState === false){
      for(let i = state.length; i >= 0; i--){
        if(state[i] === 'active'){
          state[i] = 'focus'
          break;
        }
      }
    }
    // update last state
    lastState = state

    console.log("IO_EMIT: ", state)
    // send data to nuxt app
    io.emit('data', state)
  }

  // update lastmsg
  lastMsg = data
})

io.on('connection', () => {
    console.log('CLIENT_CONNECTED');

    io.emit('data', state)
});



server.listen(port, () => {
    console.log('listening on: ', port);
});



//functions
function setState(piece, index){
  if(piece === 1){
    if(lastState[index] === 'passive'){
      state[index] = 'focus'
    }
    else {
      state[index] = 'active'
    }
    lastState[index] = state[index]
  }
  else if(piece === 0){
    state[index] = 'passive'
  }
}