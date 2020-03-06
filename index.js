
var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('public'))


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const users = {};
const messages = {};

io.on('connect', onConnect);

function onConnect(socket){
  socket.on('init', e => {
    const name = makeid(7);
    const color = getRandomColor();
    console.log(name, color);
    users[socket.id] = {name: name, color: color};
    socket.emit('default', {user: users[socket.id], time: getDateTime()});
    socket.broadcast.emit('new user', {user: users[socket.id], time: getDateTime()});
    onlineListSend();
    console.log({users: users[socket.id], time: getDateTime()});
  })

  socket.on('chat message', msg => {
    io.emit('chat message', {user: users[socket.id], msg: msg, time: getDateTime()});
    console.log({users: users[socket.id], time: getDateTime()});
    
  })

  socket.on('name change', name => {
    const oldname = users[socket.id].name;
    users[socket.id].name = name;
    io.emit('name change', {oldname: oldname, user: users[socket.id], time: getDateTime()});
    onlineListSend();
  })

  socket.on('color change', color => {
    users[socket.id].color = "#"+color;
    io.emit('color change', {user: users[socket.id], time: getDateTime()});
  })

  socket.on('disconnect', function(){
    try{
      console.log(users[socket.id].name + ' has disconnected ')
      socket.broadcast.emit('dc', {user: users[socket.id], time: getDateTime()});
      delete users[socket.id];
    }catch(e){

    }
  })


};

function onlineListSend(){
  io.emit('users-list', users);
}

// from https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getDateTime(){
  const d = new Date();
  const h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  return h + ":" + m;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});


function save(){
    // file system module to perform file operations
  const fs = require('fs');
  
  // stringify JSON Object
  var jsonContent = JSON.stringify(users);
  console.log(jsonContent);
  
  fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
  
      console.log("JSON file has been saved.");
  });
}