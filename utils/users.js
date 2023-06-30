var users = [
]

function userJoin(id,username,privkey,pubkey,image){
    const user={id,username,activeChat:"",privkey,pubkey,image}
    users.push(user)
    return user;
}
function getCurrUser(id){
    const user=users.find(user=>user.username===id);
    return user;
}
function imageupdate(image,username){
    const user = users.findIndex(user=>user.username===username);
    users[user].image=image;
}
function removeUser(id){
    users.splice(users.indexOf(id),1)
}

module.exports = {userJoin,getCurrUser,users,imageupdate};