// import React, { useEffect, useRef, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import '../css/user.css';
// import '../css/loader.css';
// import io from 'socket.io-client';

// // const socket = io('http://localhost:5500', {
// // 	withCredentials: true,
// // });

// function User() {

// 	const navigate = useNavigate();

// 	const location = useLocation();
// 	const id = location.state;

// 	const [profilePicture, setProfilePicture] = useState();
// 	const [profileViewOverlay, setProfileViewOverlay] = useState(false);
// 	const [profileUpdateLoader, setProfileUpdateLoader] = useState(false);

// 	const [users, setUsers] = useState([])
// 	const [receiver, setReceiver] = useState({_id: '0'});
// 	const [sender, setSender] = useState();

// 	const [allMessages, setAllMessages] = useState([])
// 	// const [currentChat, setCurrentChat] = useState([])

// 	const [newMessage, setNewMessage] = useState('');

// 	const [searchText, setSearchText] = useState('');

// 	const containerRef = useRef(null);

// 	// const showNotification = (user, msg) => {
// 	// 	console.log('called');
// 	// 	if ('Notification' in window ) {
// 	// 		Notification.requestPermission().then(permission => {
// 	// 			if (permission === 'granted') {
// 	// 				const notification = new Notification(user, {
// 	// 					body: msg,
// 	// 				});

// 	// 				notification.onclick = () => {
// 	// 					// Handle notification click event
// 	// 					console.log('Notification clicked');
// 	// 				};
// 	// 			}
// 	// 		});
// 	// 	} else {
// 	// 		console.log('Notifications not supported in this browser.');
// 	// 	}
// 	// };

// 	// useEffect(() => {

// 	// 	socket.emit('newUserConnected', id);

// 	// 	socket.on('usersList', (users) => {
// 	// 		setUsers((_) => {
// 	// 			return users.map((user) => ({
// 	// 				...user,
// 	// 				image: (user.image) ? arrayBufferToBase64(user.image.data.data) : ''
// 	// 			}));
// 	// 		});
// 	// 		const senderData = users.find(user => user._id === id);
// 	// 		setSender({
// 	// 			_id: senderData._id,
// 	// 			username: senderData.username,
// 	// 			status: senderData.status,
// 	// 			image: (senderData.image) ? arrayBufferToBase64(senderData.image.data.data) : ''
// 	// 		})
// 	// 	})

// 	// 	axios.get('/messages').then((res) => {
// 	// 		setAllMessages(res.data);
// 	// 	}).catch((err) => {
// 	// 		console.log(err);
// 	// 	})

// 	// 	socket.on('userStatusChange', (id, operation) => {
// 	// 		console.log('working', operation);
// 	// 		setUsers((prevUsers) =>
// 	// 			prevUsers.map((user) =>
// 	// 				user._id === id ? { ...user, status: operation } : user
// 	// 			)
// 	// 		);
// 	// 		setReceiver((prevReceiver) =>
// 	// 			prevReceiver._id === id ? { ...prevReceiver, status: operation } : prevReceiver
// 	// 	  	);
// 	// 	})

// 	// 	socket.on('message', (message) => {
// 	// 		setAllMessages((prevMessages) => [...prevMessages, message]);

// 	// 		setTimeout(() => {
// 	// 			if (containerRef.current) {
// 	// 				containerRef.current.scrollTop = containerRef.current.scrollHeight;
// 	// 			}
// 	// 		}, 1)

// 	// 	});

// 	// 	socket.on('messageError', () => {
// 	// 		toast.error('error occured', {
// 	// 			position: 'bottom-center'
// 	// 		});
// 	// 	})

// 	// 	socket.on('messageStatusUpdated', ({checked, id}) => {
// 	// 		setAllMessages((allMsgs) => {
// 	// 			return allMsgs.map(msg => {
// 	// 				if (msg._id === id) {
// 	// 					return { ...msg, receiverStatus: `${checked ? 'read' : ''}` };
// 	// 				}
// 	// 				return msg;
// 	// 			});
// 	// 		});

// 	// 	})
		
// 	// 	socket.on('messageDeleted', (id) => {
// 	// 		if(id) {
// 	// 			setAllMessages((allMsgs) => allMsgs.filter((message) => message._id !== id));
// 	// 			toast.success('message deleted', {
// 	// 				position: 'bottom-center'
// 	// 			});
// 	// 		}
// 	// 		else {
// 	// 			toast.error('deletion failed', {
// 	// 				position: 'bottom-center'
// 	// 			});
// 	// 		}
// 	// 	})

		
// 	// 	const onComponentUnmount = () => {
// 	// 		console.log('Component unmounted. Disconnecting WebSocket...');
			
// 	// 		const now = new Date();
// 	// 		const currentHour = now.getHours();
// 	// 		const currentMinute = now.getMinutes();
// 	// 		const status = `last seen ${currentHour}:${currentMinute}`
// 	// 		socket.emit('userDisconnect', id, status )
			
// 	// 		socket.disconnect();
// 	// 	}
		
// 	// 	window.addEventListener('beforeunload', onComponentUnmount);

// 	// 	return () =>{
// 	// 		onComponentUnmount();
// 	// 		window.removeEventListener('beforeunload', onComponentUnmount)
// 	// 	};

// 	// },[id])

// 	const onReceiverChange = (rec) => {
// 		setReceiver(rec);

// 		setTimeout(() => {
// 			if (containerRef.current) {
// 				containerRef.current.scrollTop = containerRef.current.scrollHeight;
// 			}
// 		}, 1)
// 	}

// 	const sendNewMessage = (e) => {
// 		e.preventDefault();
// 		if(newMessage !== '') {
// 			socket.emit('sendMessage', { 
// 				sender: id, senderName: sender.username, receiver: receiver._id, content: newMessage, chatID: (id + receiver._id) 
// 			})
// 			setNewMessage('')
// 		}
// 	}
		

// 	const getLastMessage = (ab, ba) => {
// 		const chatMessages = allMessages.filter(
// 			message => message.chatID === ab || message.chatID === ba
// 		);
// 		return chatMessages.length > 0 ? 
// 		{ content: chatMessages[chatMessages.length - 1].content, timestamp: chatMessages[chatMessages.length - 1].timestamp } : 
// 		{ content: '', time: '' };
// 	};

// 	const viewProfilePic = () => {
// 		setProfileViewOverlay(true);
// 	}

// 	const onUpdateButtonClick = () => {
// 		setProfileUpdateLoader(true);

// 		const formData = new FormData();
// 		formData.append('image', profilePicture);
// 		formData.append('id', id);
// 		axios.post('/edit-user-profile', formData ).then((res) => {
			
// 			// succesfull profile updation
// 			if(res.data) {

// 				setSender({
// 					_id: res.data._id,
// 					username: res.data.username,
// 					image: (res.data.image) ? arrayBufferToBase64(res.data.image.data.data) : ''
// 				});

// 				setProfilePicture();
// 				setProfileViewOverlay(false);
// 				setProfileUpdateLoader(false);
// 				toast.success('Profile updated', {
// 					position: 'bottom-center'
// 				});
// 			}
// 			// failed updation
// 			else {
// 				setProfileUpdateLoader(false);
// 				toast.error('Updation failed', {
// 					position: 'bottom-center'
// 				});
// 			}
// 		})
// 	}

// 	// convert Image in Buffer to Base64String
// 	const arrayBufferToBase64 = (buffer) => {
// 		var binary = '';
// 		var bytes = [].slice.call(new Uint8Array(buffer));
// 		bytes.forEach((b) => binary += String.fromCharCode(b));
// 		return window.btoa(binary);
// 	};

// 	const onMessageStatusChange = (checked, id) => {
// 		socket.emit('changeMessageStatus', { checked, id })
// 	}

// 	const onMessageDeleteButtonClick = (id) => {
// 		socket.emit('deleteMessage', id)
// 	}

// 	function countUnreadMessages(chatID) {
// 		const unreadMessages = allMessages.filter(
// 			(message) => message.chatID === chatID && message.receiverStatus !== 'read'
// 		);
// 		return unreadMessages.length;
// 	}

// 	return (
// 		<div className='user-page-main'>
// 			<div className="user-profile-view-overlay" style={{display: `${profileViewOverlay ? 'flex' : 'none'}`}}>
// 			{
// 				(profileUpdateLoader) ? (
// 					<div className="loader">
// 						<div className="white"></div>
// 						<div className="white"></div>
// 						<div className="white"></div>
// 						<div className="white"></div>
// 					</div>
// 				) : (
// 					<div className="user-profile-view-panel">
// 						<div className="user-profile-view-panel-close-button" onClick={ _ => setProfileViewOverlay(false)}>X</div>
// 						{
// 							(sender && sender.image) ? (
// 								<img 
// 									className="user-profile-view-panel-user-picture" 
// 									src={`data:${sender.image.contentType};base64,${sender.image}`} 
// 									alt='dp'
// 								/>
// 							) : (
// 								<img src='/person.jpg' className="user-profile-view-panel-user-picture" alt='person-pic'/>
// 							)
// 						}
// 						<label htmlFor="image" className='choose-file-button'>Choose File</label>
// 						<input 
// 							type="file" 
// 							accept='image/*' 
// 							onChange={(e)=>{ setProfilePicture(e.target.files[0])}}
// 							name='image' 
// 							id='image'
// 							style={{display: 'none'}}
// 						/>
// 						{
// 							profilePicture ? (
// 								<div className="upload-div">
// 									<div className="selected-file-name">
// 										{profilePicture.name}
// 									</div>
// 									<button className="selected-file-upload-button" onClick={onUpdateButtonClick}>Update</button>
// 								</div>
// 							) : ( <></> )
// 						}
// 					</div>
// 				)
// 			}
// 			</div>
// 			<div className="users-list">
// 				{
// 					(sender) && (
// 						<div className="current-user-list-tile" style={{ order: '-1'}} key={sender._id}>
// 							{
// 								(sender.image) ? (
// 									<img 
// 										className="current-user-list-tile-profile-pic" 
// 										src={`data:${sender.image.contentType};base64,${sender.image}`} 
// 										alt='profile-pic'
// 										onClick={viewProfilePic} 
// 									/>
// 								) : (
// 									<img src='/person.jpg' className="current-user-list-tile-profile-pic" alt='person-pic' />
// 								)
// 							}
// 							<div className="current-user-list-tile-username" >{sender.username}</div>
// 							<div className="logout-button-div">
// 								<img src="/logout.png" alt="logout" onClick={ _ => navigate('/login')} />
// 							</div>
// 						</div>
// 					)
// 				}
// 				{
// 					(users.length === 0) ? (
// 						<div className="users-list-loader-container">
// 							<div className="loader">
// 								<div className="white"></div>
// 								<div className="white"></div>
// 								<div className="white"></div>
// 								<div className="white"></div>
// 							</div>
// 						</div>
// 					) : (
// 						users.map((value) => {
// 							const lastMessage = getLastMessage(`${value._id}${id}`, `${id}${value._id}`);
// 							const unreadCount = countUnreadMessages(value._id + id);
// 							const timestamp = new Date(lastMessage.timestamp)
// 							if(value._id === id) { }
// 							else if(value._id === receiver._id) {
// 								return <div className="list-tile" style={{backgroundColor: '#404040'}} key={value._id}>
// 									{(value.status === 'online') && (<div className="list-tile-online-status"></div>)}
// 									{
// 										(value.image) ? (
// 											<img 
// 												className="list-tile-profile-pic" 
// 												src={`data:${value.image.contentType};base64,${value.image}`} 
// 												alt='dp'
// 											/>
// 										) : (
// 											<img src='/person.jpg' className="list-tile-profile-pic" alt='person-pic' />
// 										)
// 									}
// 									<div className="list-tile-middle-div">
// 										<div className="list-tile-username" >{value.username}</div>
// 										<div className="list-tile-last-message">{lastMessage.content}</div>
// 									</div>
// 									<div className="last-message-time-and-unread-message-div">
// 										{(lastMessage.timestamp) && (<div className="last-message-time">{`${timestamp.getHours()}:${timestamp.getMinutes()}`}</div>) }
// 										{(unreadCount !== 0) && (<div className="list-tile-unread-message">{unreadCount}</div>) }
// 									</div>
// 								</div>
// 							}
// 							else {
// 								return <div className="list-tile" onClick={ _ => onReceiverChange(value)} key={value._id}>
// 									{(value.status === 'online') && (<div className="list-tile-online-status"></div>)}
// 									{
// 										(value.image) ? (
// 											<img 
// 												className="list-tile-profile-pic" 
// 												src={`data:${value.image.contentType};base64,${value.image}`} 
// 												alt='dp'
// 											/>
// 										) : (
// 											<img src='/person.jpg' className="list-tile-profile-pic" alt='person-pic'/>
// 										)
// 									}
// 									<div className="list-tile-middle-div">
// 										<div className="list-tile-username" >{value.username}</div>
// 										<div className="list-tile-last-message">{lastMessage.content}</div>
// 									</div>
// 									<div className="last-message-time-and-unread-message-div">
// 										{(lastMessage.timestamp) && (<div className="last-message-time">{`${timestamp.getHours()}:${timestamp.getMinutes()}`}</div>) }
// 										{(unreadCount !== 0) && (<div className="list-tile-unread-message">{unreadCount}</div>) }
// 									</div>
// 								</div>
// 							}
// 						})
// 					)
// 				}
// 			</div>
// 			{
// 				(receiver._id === '0') ? (
// 					<div className="welcome-div">
// 						<img src="/message.png" alt="msg-icon" />
// 					</div>
// 				) : (
// 					<div className="chat-area">
// 						<div className="top-bar">
// 							{
// 								(receiver.image) ? (
// 									<img 
// 										className="profile-picture" 
// 										src={`data:${receiver.image.contentType};base64,${receiver.image}`} 
// 										alt='dp'
// 									/>
// 								) : (
// 									<img src='/person.jpg' className="profile-picture" alt='person-pic' />
// 								)
// 							}
// 							<div className="top-bar-user-data-div">
// 								<div className='top-bar-username'> { receiver.username } </div>
// 								<div className='top-bar-user-status'> { receiver._id } </div>
// 							</div>
// 							<div className="message-search-field-div">
// 								<input 
// 									className="message-search-field" 
// 									type='text'
// 									placeholder='Search in conversation . . .' 
// 									onChange={ e => setSearchText(e.target.value)}
// 								/>
// 							</div>
// 						</div>

// 						<div className="messages-area" ref={containerRef}>
// 						{
// 							allMessages.map((value) => {
// 								const timestamp = new Date(value.timestamp);

// 								if(((value.sender === receiver._id && value.receiver === id) || (value.sender === id && value.receiver === receiver._id)) && (searchText === '' || value.content.toLowerCase().includes(searchText.toLowerCase())))
// 								{
// 									if(value.sender === id) {
// 										return <div key={value._id} className='user-message-tile'>
// 											<div className="message-content">{value.content}</div>
// 											<div className="message-tile-bottom-row">
// 												<div className="message-time">
// 													{`${timestamp.getHours()}:${timestamp.getMinutes()}`}
// 												</div>
// 												<img src={(value.receiverStatus ? '/blue-check2.png' : 'grey-check.png')} className="mark-as-read-sender" />
// 											</div>
// 											<img src='/delete.png' className="user-message-tile-delete-button" onClick={ _ => onMessageDeleteButtonClick(value._id)}/>
// 										</div>
// 									}
// 									else if(value.sender === receiver._id) {
// 										return <div key={value._id} className='reciepient-message-tile' onClick={ _ => onMessageStatusChange(value.receiverStatus ? false : true, value._id)}>
// 											<div className="message-content">{value.content}</div>
// 											<div className="message-tile-bottom-row">
// 												<div className="message-time">
// 													{`${timestamp.getHours()}:${timestamp.getMinutes()}`}
// 												</div>
// 												<input 
// 													type='checkbox' 
// 													onChange={ e => onMessageStatusChange(e.target.checked, value._id)} 
// 													className="mark-as-read-receiver" 
// 													checked={value.receiverStatus}
// 												/>
// 											</div>
// 										</div>
// 									}
// 								}
// 							})
// 						}
// 						</div>

// 						<form className="bottom-bar" onSubmit={sendNewMessage}>
// 							<input
// 							 	type="text" 
// 								placeholder='Type a message . . .' 
// 								onChange={ e => setNewMessage(e.target.value)} 
// 								value={newMessage}
// 								autoFocus
// 							/>
// 							<button type='submit'>
// 								<img src="/send.png" alt="" />
// 							</button>
// 						</form>
// 					</div>
// 				)
// 			}
// 		</div>
// 	)
// }

// export default User

