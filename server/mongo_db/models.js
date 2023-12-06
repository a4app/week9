const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
});

const MessageSchema = new mongoose.Schema({
    sender: String,
    senderName: String,
    receiver: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    receiverStatus: { type: String, default: '' },
    chatID: String,
});

const User = mongoose.model("User", UserSchema, 'users');
const Message = mongoose.model("Message", MessageSchema, 'messages');

module.exports = { user: User , message: Message};