
window.onload = function (){
    const socket = io();
    let color = '';
    const messageContainer = document.getElementById('messages')
    const messageForm = document.getElementById('send-container');
    const messageInput = document.getElementById('message-input');
    const onlineContainer = document.getElementById('users')
    const scrollbar = document.getElementById('scrollbar');
    init();

    messageForm.addEventListener('submit', e =>{
        e.preventDefault(); // prevents page reloading
        if(!changeUsername(messageInput.value) && !changeColor(messageInput.value)){
            socket.emit('chat message', messageInput.value);
        }
        messageInput.value = '';
        return false;

    })
    function init(){
        socket.emit('init');
        
    }

    socket.on('default', e => {
        console.log(e)
        append('you have joined', e.user.color, e.time);
        append('your default name is: ' + e.user.name, e.user.color, e.time);
        color = e.color;
        
    })

    socket.on('users-list', e => {
        updateUserList(e)
        console.log(e);
    })

    socket.on('new user', e =>{
        append(e.user.name + ' has joined', e.user.color, e.time);
        console.log(e);
    });

    socket.on('chat message', e =>{
        append(e.user.name + ': ' +e.msg, e.user.color, e.time);
        scrollbar.scrollTop = 999999999;
        console.log(e);
    });

    socket.on('name change', e =>{
        append(e.oldname + " is now " + e.user.name, e.user.color, e.time );
        console.log(e);
    });

    socket.on('color change', e =>{
        append(e.name + "'s new color is " + e.color, e.color, e.time);
        console.log(e);
    });

    socket.on('dc', e => {
        append(e.user.name + " has disconnected", e.user.color, e.time);
    })

    function changeUsername(e){
        const nicknameComp = '/nick'
        const message = e.slice(0, nicknameComp.length);
        if(nicknameComp == message){
            name = e.slice(nicknameComp.length, e.length);
            if(name == ''){
                return true;
            }else{
                socket.emit('name change', name );
                return true;
            }
        }
    }

    function changeColor(e){
        const nicknameComp = '/nickcolor'
        const message = e.slice(0, nicknameComp.length);
        if(nicknameComp == message){
            name = e.slice(nicknameComp.length, e.length);
            if(name == ''){
                return true;
            }else{
                socket.emit('color change', name );
                return true;
            }

        }
    }



    function append(msg, color, time){
        const messageElement = document.createElement('li')
        messageElement.style.color = color;
        messageElement.innerText = time + ": " + msg;
        messageContainer.append( messageElement)
    }

    
    function updateUserList(users){
        onlineContainer.innerHTML = "";

        for(let id in users){
            const userElement = document.createElement('li')
            userElement.innerText = users[id].name;
            userElement.style.color = users[id].color;
            onlineContainer.append(userElement);
        }




    }




}

