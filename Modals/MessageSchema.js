const mongoose=require('mongoose')

const MessageSchema=mongoose.Schema({
    SenderName: String,
    SenderEmail: String,
    SenderMessage: String,
})

module.exports = mongoose.model("Messages",MessageSchema)