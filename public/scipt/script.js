
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
        if(isCommand(messageInput.value)){
            if(!changeColor(messageInput.value) && !changeUsername(messageInput.value)){
                append('usage: \n Name: /nick <name> \n Color: /nickcolor <#rrggbb>', '#000000');
            }
        }else{
            socket.emit('chat message', messageInput.value)
        }
        messageInput.value = '';
        return false;

    })
    function init(){
        if(this.Cookies.get('name') != null && this.Cookies.get('color') != null){
            socket.emit('cookie', {name: this.Cookies.get('name'), color: this.Cookies.get('color')})
        }else{
            socket.emit('init');
        }


    }

    function isCommand(msg){
        if(msg.charAt(0) == '/'){
            return true;
        }
        return false;
    }



    socket.on('userInfo', info =>{
        this.Cookies.set('name', info.name);
        this.Cookies.set('color', info.color);
    });


    socket.on('output', out =>{
        //console.log(out)
        append(out.msg, out.color);
        
    });

    socket.on('history', e => {
        //console.log('history')
        let msgs = e.msgs;
        for(let i = 0; i < msgs.length; i++){
            //console.log(msgs[i].msg, msgs[i].color)
            append(msgs[i].msg, msgs[i].color);
        }
    })

    socket.on('users-list', e => {
        updateUserList(e)
        //console.log(e);
    })


    function changeUsername(e){
        const nicknameComp = '/nick '
        const message = e.slice(0, nicknameComp.length);
        if(nicknameComp == message){
            name = e.slice(nicknameComp.length , e.length);
            if(name == ''){
                append('usage: /nick <name>', '#000000');
                return false;
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
            color = e.slice(nicknameComp.length, e.length);
            if(color == ''){
                append('usage: /nickcolor <#rrggbb>', '#000000');
                return false;
            }else{
                if(isColor(color)){
                    socket.emit('color change', color);
                    return true;
                }else{
                    append(color + ' is not a valid hex color ', '#000000');
                    return false
                }

            }

        }
    }
    function isColor(h) {
        var re = /[0-9A-Fa-f]{6}/g;
        if(re.test(h)) {
            //alert('valid hex');
            return true;
        } else {
            //alert('invalid');
            return false;
        }
    }



    function append(msg, color){
        const messageElement = document.createElement('li')
        messageElement.style.color = color;
        messageElement.innerText = msg;
        messageContainer.append( messageElement)
        scrollbar.scrollTop = 999999999;
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

