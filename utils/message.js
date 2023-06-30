const moment= require("moment");

const {encryptText,decryptText}= require("crypto")
function formatMessage(username,text,users){
    return {
        username,
        text,
        time:moment().format("h:mm a"),
        decrypt:decryptText,
        users
    }
}
module.exports = formatMessage;