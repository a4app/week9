const methods = require('./methods')
const socketIO = require('socket.io');

// const usersNameList = {
//     '65620d7c8d56582604dc5940': 'parthan',
//     '65620d708d56582604dc593e': 'arjun',
//     '656209dd2dc49a5f33906280': 'saroj',
//     '6562095d2dc49a5f3390627e': 'favas'
// }

const initializeWebSocket = (server) => {
	const io = socketIO(server, {
		cors: {
			origin: process.env.ORIGIN_URL,
			methods: ['GET', 'POST'],
			credentials: true, 
		},
	});

	const connectedUsers = new Map(); 

	io.on('connection', (socket) => {
		const userId = socket.handshake.query.id;	// get userID of connected user
		connectedUsers.set(userId, socket.id);		// add userID, socketID to online users map

		// emit connected userID to all 
		io.emit('newUserConnected', (userId))

		// event to get list of online users
		socket.on('getAllOnlineUsers', () => {
			// emit array of online usersIDs to same socket
			socket.emit('updateAllOnlineUsers',  Array.from(connectedUsers.keys()) )
		})

		// new message arrived
		socket.on('sendMessage', (messageData) => {
			methods.addNewMessage(messageData).then((msg) => {
				io.to(connectedUsers.get(msg.receiver)).emit('message', msg) // to destination of message
				io.to(connectedUsers.get(msg.sender)).emit('message', msg) // to source of message
			}).catch(() => {
				socket.emit('messageError')
			})
		});

		// change message status read/unread
		socket.on('changeMessageStatus', ({ checked, message}) => {
			methods.updateMessageStatus(message._id, (checked ? 'read' : 'unread')).then(() => {

				// emit to message receiver
				io.to(connectedUsers.get(message.receiver)).emit('messageStatusUpdated', { 
					checked: checked,
					id: message._id
				})

				// emit to message sender
				io.to(connectedUsers.get(message.sender)).emit('messageStatusUpdated', { 
					checked: checked, 
					id: message._id 
				})

			}).catch(() => {
				socket.emit('messageStatusUpdationFailed')
			})
		})

		socket.on('changeMessageStatusAll', ({chatId, receiver, sender}) => {
			console.log(chatId, receiver, sender);
			methods.updateAllStatusRead(chatId, receiver).then((res) => {
				io.to(connectedUsers.get(receiver)).emit('updateMessageStatusAll', ({chatId, receiver})) // to destination of message
				io.to(connectedUsers.get(sender)).emit('updateMessageStatusAll', ({chatId, receiver})) // to source of message
			}).catch((err) => {
				console.log('Failedd');
			})
		})

		// delete a message
		socket.on('deleteMessage', ({id, sender, receiver}) => {
			methods.deleteMessage(id).then(() => {
				io.to(connectedUsers.get(receiver)).emit('messageDeleted', id); // to message receiver
				io.to(connectedUsers.get(sender)).emit('messageDeleted', id); 	// to message sender
			}).catch(() => {
				socket.emit('messageDeletionFailed')
			})
		})

		// user disconnected from socket
		socket.on('disconnect', () => {
			methods.updateLastSeen(userId).then((res) => {
				io.emit('userDisconnected', ({id: userId, status: res})); // emit user status change to all
			}).catch(() => {
				io.emit('userDisconnected', ({id: userId, status: '--'}))
			})
			connectedUsers.delete(userId); // remove userID from online users map
		});
	});

	return io;
}

module.exports = initializeWebSocket;
