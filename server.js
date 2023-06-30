const path = require("path")
const bodyParser = require('body-parser')
const express = require("express")
const http = require("http")
const socketio=require("socket.io")
const fmessage= require("./utils/message")
const crypto = require("crypto")
const cors = require("cors");
const {userJoin,users, getCurrUser,imageupdate}= require("./utils/users")
const {encryptText,decryptText}= require("./utils/crypto")
const {addchat,getChat,chats}= require("./utils/chats")
const app = express()
const server = http.createServer(app)
const port = 3000 || process.env.port
app.use(express.static( path.join(__dirname, '/public')))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const io=socketio(server,{ 
    cors: {    
      origin: "*",    
      methods: ["GET", "POST"]  
    }});
io.on("connection",(socket)=>{

    //Check if user ID already saved
    io.to(socket.id).emit(`requestCachedId`)
    socket.on(`receivedCachedId`,({id})=>{
        //find the old user 
        for(let i=0;i<users.length;i++){
            if(users[i].id == id){
                users[i].oldId = users[i].id
                users[i].id = socket.id
                io.to(socket.id).emit(`updateOldUser`,users[i])
                break
            }
        }
        io.emit("userJoined",users)
    })
    
    socket.on("userJoin",(name)=>{
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            // The standard secure default length for RSA keys is 2048 bits
            modulusLength: 2048
        })
        if(users.find(user=>user.username==name.username)==undefined){
            const user = userJoin(socket.id,name.username,privateKey, publicKey,name.image)
            console.log(user)
           
            io.emit("userJoined",users)
        }else{
            io.to(socket.id).emit("usererror","Username already exists")
        }
      
    })
    socket.on("imageupdate",(name)=>{
       imageupdate(name.image,name.username)
        io.emit("userJoined",users)
    })
   
    socket.on("joinUser",(user)=>{
        console.log(user);
        var index1=users.findIndex(user1=>user1.username===user.currchat);
        var index2=users.findIndex(user1=>user1.username===user.username);
        const user1 = getCurrUser(user.username)
        const user2 = getCurrUser(user.currchat)
        
       
       
        var newname=index1<index2?user.currchat+user.username:user.username+user.currchat;
      
         user1.activeChat=newname;
         console.log(user1,newname);
        socket.join(newname)
        socket.to(user2.id).emit("Noti",{"name":user1.username,"newname":newname});
        io.sockets.in(newname).emit('ActiveChat',{newname,"chats":getChat(newname)});
       
        
       
    })
    socket.on("chatMessage",(user)=>{
        const user1 = getCurrUser(user.username)
        console.log(user1.activeChat);
        var pubkey=users.find(user2=>user2.username==user1.activeChat.replace(user1.username,"")).pubkey;
        console.log(pubkey);
        addchat(user1.activeChat,user1.username,user.message);
        console.log(chats);
        // socket.to(user1.activeChat).emit("message",fmessage("User",encryptText(user.message,pubkey).toString('base64'),users)) <- Changed to actually have username
        socket.to(user1.activeChat).emit("message",fmessage(user1.username,encryptText(user.message,pubkey).toString('base64'),users))

    })

    //added by ob
    socket.on("disconnect",(reason)=>{
        // try after a couple seconds
        setTimeout(function(){ 
            let found = false
            for(let i=0;i<users.length;i++){
                if(users[i].oldId == socket.id){
                    found=true
                    break
                }
            }
       
            if(!found){
                for(let i=0;i<users.length;i++){
                    if(users[i].id == socket.id){
                        users.splice(i, 1);
                        break
                    }
                }
                io.emit("userJoined",users)
            }

        }, 3000);


        
       

       
    })

       
})
app.post("/decrypt/:uid",(req,res)=>{
   var {uid}=req.params;
   console.log(req.body);
   var privkey=users.find(user2=>user2.username==uid).privkey;
   const buff = Buffer.from(req.body.message, 'base64');
   var plainttext=decryptText(buff,privkey)
   console.log(plainttext.toString());
   res.send({text:plainttext.toString()});
})
server .listen(port ,()=>console.log("port started on "+port))