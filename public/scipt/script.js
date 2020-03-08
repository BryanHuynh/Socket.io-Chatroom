
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
        if(!changeColor(messageInput.value) && !changeUsername(messageInput.value)){
            socket.emit('chat message', messageInput.value);
        }
        messageInput.value = '';
        return false;

    })
    function init(){
        socket.emit('init');
    }

    socket.on('output', out =>{
        append(out.msg, out.color);
        scrollbar.scrollTop = 999999999;
    });


    socket.on('users-list', e => {
        updateUserList(e)
        console.log(e);
    })


    function changeUsername(e){
        const nicknameComp = '/nick '
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
        const nicknameComp = '/nickcolor '
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



    function append(msg, color){
        const messageElement = document.createElement('li')
        messageElement.style.color = color;
        messageElement.innerText = msg;
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

