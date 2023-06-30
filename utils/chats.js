chats=[]

function addchat(chatname,name,message){
    if(chats.find(chat=>chat.chatname==chatname)==undefined)
    {
        chats.push({"chatname":chatname,"chat":[]})
    }
    chats.find(chat=>chat.chatname==chatname).chat.push({name,message})
    console.log(chats);
}
function getChat(chatname){
    if(chats.find(chat=>chat.chatname==chatname)==undefined)
    {
        chats.push({"chatname":chatname,"chat":[]})
    }
    const user=chats.find(chat=>chat.chatname==chatname);
    return  user;
}

module.exports ={addchat,getChat,chats};