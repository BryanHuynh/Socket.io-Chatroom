// file system module to perform file operations
const fs = require('fs');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.static('public'))
app.use(cookieParser());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


const users = {};
const messages = {};

io.on('connect', onConnect);

function onConnect(socket){


  socket.on('cookie', e =>{
    if(nameAvailable(e.name)){
      users[socket.id] = e;
      //console.log('name open')
      loggedOn(e);
    }else{
      //console.log('name closed')
      users[socket.id] = e;
      users[socket.id].name = makeid(7);
      socket.emit('userInfo', users[socket.id]);
      loggedOn(users[socket.id]);
    }
  })



  socket.on('init', e => {
    const name = makeid(7);
    const color = getRandomColor();
    users[socket.id] = {name: name, color: color};
    socket.emit('userInfo', users[socket.id]);
    loggedOn(users[socket.id])
  })

  function loggedOn(e){
    let file = JSON.parse(read());
    socket.emit('output', output('you have joined', e.color, false, false));
    socket.emit('output', output('your default name is: ' + e.name, e.color, false, false));
    socket.broadcast.emit('output', output(e.name + ' has joined', e.color, true, false));
    socket.emit('history', file);
    onlineListSend();
  }

  socket.on('chat message', msg => {
    //io.emit('chat message', {user: users[socket.id], msg: msg, time: getDateTime()});
    io.emit('output', output(msg, users[socket.id].color))
  })

  function output(msg, color, saveFlag=true, stamp=true){
    let out = {msg: getDateTime() +" "+  users[socket.id].name  + ": " + msg, color: color};
    //messages.push(out);
    if(stamp == false){
      out = {msg: getDateTime() +": "+ msg, color: color};
    }
    if(saveFlag){
      save(out);
    }
    return out;
  }

  socket.on('name change', name => {
    const oldname = users[socket.id].name;
    if(nameAvailable(name)){
      users[socket.id].name = name;
      io.emit('output', output(oldname + " is now " + name, users[socket.id].color));
    }else{
      socket.emit('output', output( name + ' in use', users[socket.id].color, false));
    }
    socket.emit('userInfo', users[socket.id])
    onlineListSend();
  })

  socket.on('color change', color => {
    users[socket.id].color = color;
    console.log(users[socket.id].color);
    io.emit('output', output(users[socket.id].name + "'s new color is " + color, color, true, false));
    socket.emit('userInfo', users[socket.id])
    onlineListSend();
  })

  socket.on('disconnect', function(){
    try{
      socket.broadcast.emit('output', output(users[socket.id].name + ' has disconnected ', users[socket.id].color, true, false));
      delete users[socket.id];
      onlineListSend();
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

function nameAvailable(name){
  //console.log('name ', name);
  for(let id in users){
    //console.log('name check: ', users[id].name);
    if(name == users[id].name){
      return false;
    }
  }
  return true;
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getDateTime(){
  const d = new Date();
  const h = d.getHours();
  var m = addZero(d.getMinutes());
  return h + ":" + m;
}

http.listen(process.env.PORT || 5000);


function save(e){
  // stringify JSON Object
  var jsonContent = JSON.stringify(e);
  let file = fs.readFileSync('output.json','utf8').slice(0,-2);
  file += ', \n'+jsonContent + ']}';
  fs.writeFile("output.json", file, 'utf8', function (err) {
      if (err) {
          //console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
      //console.log("JSON file has been saved.");
  });
}


function read(){
  let file = fs.readFileSync('output.json','utf8');
  //console.log(file);
  return file
}


