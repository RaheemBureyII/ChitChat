const socket = io("http://localhost:3000");
var currchat=0;
var username;
var chats=[]
var currchatname;
var submitname = document.getElementsByClassName("submit");
submitname[0].onclick=()=>{
    namechange()
    var name2 = document.getElementById("name");
    if(name2.nodeName=="INPUT"){
        if(name2.value==" "){
           
            username="Default User"
        }else{
            username= name2.value
        }
    }else{
        if (name2.innerHTML==""){
            username="Default User"
        }else{
           username= name2.innerHTML
        }
    }
    var image=document.getElementsByClassName("profimg")[0].src;
    socket.emit("userJoin",{username,image});
}
    

//Added by OB
//On every connection , the server will request an ID if there is one that matches an old user, that data will be sent
socket.on(`requestCachedId`,(ss)=>{
    //check if localstorage has id
    const id = sessionStorage.getItem('id');
    if(id && id!="")
        socket.emit(`receivedCachedId`,{id})
})

socket.on(`updateOldUser`,(oldUserData)=>{
    console.log(oldUserData)
    document.getElementById("name").value = oldUserData.username;
    username = oldUserData.username
    sessionStorage.setItem('id',oldUserData.id);
})

socket.on("userJoined",(users)=>{
    console.log(users)

    //added by ob
    //Find the current name of this user and store the id in local storage
    for(let user of users){
        if(user.username == document.getElementById("name").innerHTML){
            sessionStorage.setItem('id',user.id);
        }
    }

    var userlist = document.getElementsByClassName("useritemlist")[0];
   
  
   
    userlist.innerHTML="";
    users.filter(user=>user.username!=username).forEach(element => {
       
        var user = document.createElement("div")
        user.classList.add("useritem");
        user.onclick=()=>{
            currchat=element.username
            console.log(element.username);
            socket.emit("joinUser",{currchat,username})
            if(document.getElementsByClassName("selected")[0]!=undefined){
                document.getElementsByClassName("selected")[0].classList.remove("selected");
            }
            user.classList.remove("noti");
            user.classList.add("selected");
        }
      
        //pubkey.innerHTML=`Private Key: ${element.privkey.toString('base64')}`
        user.innerHTML= `<img
        src="${element.image}"
        height="25px"> 
        <div>
            <div>${element.username}</div>
            <div class="online-indicator-container"><span class="online-circle"></span>Online</div>
        </div>
        </div>`
        userlist.appendChild(user);
    });
})
socket.on("message",(message)=>{
    console.log("msg")
    console.log(message)
    var chatbox = document.getElementsByClassName("imessage");
    var msg = document.createElement("p");
    msg.classList.add("from-them")
    fetch("http://localhost:3000/decrypt/"+username,{method:"POST",headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message:message.text})}).then(response => response.json())
    .then((data)=>{
        msg.innerHTML=data.text;
        console.log(data)
    });
    
    
    chatbox[0].appendChild(msg);

})

function namechange(){
    var el = document.querySelector('#name');
    var el2 = document.querySelector('.submit');
    
    if(el2.alt=="edit"){
        el2.alt="send"
       
        el2.src="https://cdn-icons-png.flaticon.com/128/7191/7191998.png";
        el.outerHTML = `<input maxLength="10" type="text" name="name" placeholder="Enter name here" id=${el.id}>` + " " + '</input>';
    }else{
        el2.alt="edit";
        el.outerHTML = `<p id=${el.id}>` + el.value + '</p>';
        el2.src="https://cdn-icons-png.flaticon.com/128/833/833275.png";
    }
    document.getElementById("usernameerror").style.display="none";

}

socket.on("ActiveChat",(newname)=>{
    var chat = document.getElementsByClassName("chat")[0];
    chat.classList.remove("nochat");
    chat.innerHTML=` <div class="imessage">

        </div>
        <div>
            <input type="text" class="message" name="message" id="message" placeholder="Type something here">
            <button type="button" class="sendbutton slide fill">
                <div>SEND</div>
                <i class="icon-arrow-right"></i>
            </button>
        </div>`

        var sendbutton = document.getElementsByClassName("sendbutton");
    sendbutton[0].onclick= ()=>{
    var message = document.getElementById("message");
    var chatbox = document.getElementsByClassName("imessage");
    var msg = document.createElement("p");
    msg.classList.add("from-me")
    msg.innerHTML=message.value;
    chatbox[0].appendChild(msg);
    socket.emit("chatMessage",{"message":message.value,username})
    message.value="";
    message.focus()
}
    console.log(newname);
    var chatbox = document.getElementsByClassName("imessage");
    chatbox[0].innerHTML="";
    currchatname=newname.newname;
    chats=newname.chats;
    // if(chats.find(chat=>chat.chatname==newname.newname)==undefined)
    // {
    //     chats.push({"chatname":newname.newname,"chat":[]})
    // }
    // console.log(chats.find(chat=>chat.chatname==newname.newname))
    
    // console.log(chats.find(chat=>chat.chatname==newname.newname),chats)
    
    chats.chat.forEach((currchat)=>{
        if(currchat.name==username){
            var msg = document.createElement("p");
            msg.classList.add("from-me")
            msg.innerHTML=currchat.message;
            chatbox[0].appendChild(msg);
        }else{
            var msg = document.createElement("p");
            msg.classList.add("from-them")
            msg.innerHTML=currchat.message;
            chatbox[0].appendChild(msg);
        }
    })
        
})
socket.on("Noti",(name1)=>{
    var useritems=document.getElementsByClassName("useritem");
    var item;
    for(var x=0;x<useritems.length;x++)
    {
        if(useritems[x].textContent.includes(name1.name)){
            var item=useritems[x];
        }
    }
    console.log(currchatname);
    if(name1.newname!==currchatname){
        item.classList.add("noti");
    }
    
})
function myFunction() {
    var popup = document.getElementsByClassName("hover_bkgr_fricc");
    popup[0].classList.toggle("show");
    var grid = document.getElementsByClassName("grid-item");
    for(var x=0;x<grid.length;x++){
        grid[x].onclick=(e)=>{
        var profimg = document.getElementsByClassName("profimg");
        
        profimg[0].src=e.target.src;
        if(username!=undefined){
            var image=document.getElementsByClassName("profimg")[0].src;
            socket.emit("imageupdate",{username,image});
        }
       
        popup[0].classList.toggle("show");
    
    }
    }
   
}

socket.on("usererror",(error1)=>{
    namechange()
   document.getElementById("usernameerror").style.visibility="block";
   
})