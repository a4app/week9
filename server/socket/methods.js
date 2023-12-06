const Models = require('../mongo_db/models')
const { ObjectId } = require('mongodb');

const MessageModel = Models.message;
const UserModel = Models.user;

const methods = {

    // add new message to database ( messageData object )
    addNewMessage: (message) => {
        return new Promise( async (resolve, reject) => {
            try {
                const newMessage = new MessageModel(message);
                const data = await newMessage.save();
                resolve(data);
            }
            catch(err) {
                console.log(err);
                reject(err)
            }
        })
    },

    // delete a message ( messageID )
    deleteMessage: (id) => {
        return new Promise( async (resolve, reject) => {
            try {
                const data = await MessageModel.findOneAndDelete({_id: id});
                data ? resolve(data._id) : reject('no document found')
            }
            catch(err) {
                console.log(err);
                reject(err)
            }
        })
    },

    // update message status read/unread ( messageID, status )
    updateMessageStatus: (id, status) => {
        return new Promise( async (resolve, reject) => {
            try {
                const update = await MessageModel.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { receiverStatus: status} },
                    {new: true}
                )
                return update ? resolve(true) : reject(false);
            }
            catch(err) {
                console.log(err);
                reject(false)
            }
        })
    },

    // set user status .. last seen ( userID )
    updateLastSeen: (id) => {
        return new Promise( async (resolve, reject) => {
            const date = new Date();
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amOrPm}`;

            try {
                const data = await UserModel.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: { status: `Last seen ${formattedTime}` } },
                    { new: true }
                )
                data ? resolve(`Last seen ${formattedTime}`) : reject('--')
                
            }
            catch(err) {
                console.log(err);
                reject('--')
            }
        })
    }

}

module.exports = methods;