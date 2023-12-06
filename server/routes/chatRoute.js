const express = require('express');
const router = express.Router();

const Models = require('../mongo_db/models');
const MessageModel = Models.message;
const UserModel = Models.user;

// to all users list in database
router.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        // return users list.. request OK
        return res.status(200).json(users);
    }
    catch(e) {
        console.log(e);
        // server error
        return res.status(500);
    }
})

// get all message data... for a specific user chats
router.post('/messages', async (req, res) => {
    const { id } = req.body;
    try {
        const messages = await MessageModel.find({
            $or: [
                { sender: id },
                { receiver: id },
            ]
        })
        // return messages list
        return res.status(200).json(messages);
    }
    catch(err) {
        console.log(err);
        // server error
        return res.status(500);
    }
})

module.exports = router;