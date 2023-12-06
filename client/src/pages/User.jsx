import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import '../css/loader.css';
import axios from 'axios';
import '../css/user.css';

const URL = 'https://chat-app-server-pi2x.onrender.com';

function User() {

    const location  = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

	const socketRef = useRef(null);

	const [searchText, setSearchText] = useState('');

	const containerRef = useRef(null);

	const [newMessage, setNewMessage] = useState('');

	const [profilePicture, setProfilePicture] = useState();
	const [profileViewOverlay, setProfileViewOverlay] = useState(false);
	const [profileUpdateLoader, setProfileUpdateLoader] = useState(false);

    const [userData, setUserData] = useState({
        _id: location.state._id,
        username: location.state.username,
        status: location.state.status,
        image: location.state.image ? arrayBufferToBase64(location.state.image.data.data) : '',
    });

	// get data from redux store
    const { usersList, currentReceiver, messages, currentChatId } = useSelector((state) => state.chat);

	// data of current chat receiver
	const currentReceiverRef = useRef(null);
	currentReceiverRef.current = currentReceiver;

	useEffect(() => {
		
		// connect to socket
		socketRef.current = io( URL , {
			withCredentials: true,
			query: { id: userData._id }
		});

		// get list of all users
        axios.get( URL + '/users').then((res) => {
            const users = res.data.map((user) => {
                return {
                    ...user,
					// convert buffer image to base 64 string
                    image: (user.image) ? arrayBufferToBase64(user.image.data.data) : '',
                }
            })
			// store users list in redux store
            dispatch({
                type: 'SET_USERS_DATA',
                payload: users,
            })

			// emit event to get list of all online users 
			socketRef.current.emit('getAllOnlineUsers')

        }).catch((err) => {
			console.log(err);
			toast.error('Error occured !')
		})

		// get all previuos messages of a specific user
		axios.post( URL + '/messages', { id: userData._id }).then((res) => {
			// store messages in redux store
			dispatch({
				type: 'SET_ALL_MESSAGES',
				payload: res.data,
			})
		}).catch((err) => {
			console.log(err);
			toast.error('Something went wrong !')
		})



		/*-----------------------------------------------------------------------------------------*/

		// list if online users ( array of userIDs )
		socketRef.current.on('updateAllOnlineUsers', (onlineUsersList) => {
			// update users status in users list
			dispatch({
				type: 'SET_ALL_ONLINE_USERS',
				payload: onlineUsersList
			})
		})

		// new message from socket ( message object )
		socketRef.current.on('message', (msg) => {
			// add message to existing messages list
			dispatch({
				type: 'ADD_NEW_MESSAGE',
				payload: msg
			})

			// scroll to bottom of the messages area
			setTimeout(() => {
				if (containerRef.current) {
					containerRef.current.scrollTop = containerRef.current.scrollHeight;
				}
			}, 1)

			// check condition for showing notification for new arrived message
			if(msg.sender !== currentReceiverRef.current._id && msg.sender !== userData._id) {
				// call method for notification
				showNotification(msg.senderName, msg.content)
			}

		})

		// error occured while sending message
		socketRef.current.on('messageError', () => {
			toast.error('Message not send')
		})

		// new user connected to socket ( id of newly connected user )
		socketRef.current.on('newUserConnected', (id) => {
			// set status of user as 'online'
			dispatch({
				type: 'UPDATE_USER_STATUS',
				payload: {
					userId: id,
					status: 'online'
				}
			})
		})

		// online user disconnected from socket ( userID and last seen data )
		socketRef.current.on('userDisconnected', ({id, status}) => {
			// set user status with last seen time
			dispatch({
				type: 'UPDATE_USER_STATUS',
				payload: {
					userId: id,
					status: status
				}
			})
		})

		// user deleted a message ( messageID )
		socketRef.current.on('messageDeleted', (id) => {
			// remove message from messages list
			dispatch({
				type: 'DELETE_MESSAGE',
				payload: id
			})
		})

		// emitted event for deleting a message failed..  
		socketRef.current.on('messageDeletionFailed', () => {
			toast.error('Failed to delete', { autoClose: 2000 })
		})

		// message status changed to read/unread ( true/false and messageID )
		socketRef.current.on('messageStatusUpdated', ({ checked, id }) => {
			// update message status 
			dispatch({
				type: 'UPDATE_MESSAGE_STATUS',
				payload: {
					id: id,
					status: checked ? 'read' : 'unread'
				}
			})
		})

		// emitted event for changing a message status failed 
		socketRef.current.on('messageStatusUpdationFailed', () => {
			toast.error('Operation failed', { autoClose: 2000 })
		})

		/*---------------------------------------------------------------------------------------------*/

		// disconnect user when component unmounted
		const onComponentUnmount = () => {
			console.log('Component unmounted. Disconnecting WebSocket...');
			socketRef.current.disconnect();
		}
		
		// get direct closing of window
		window.addEventListener('beforeunload', onComponentUnmount);

		return () =>{
			onComponentUnmount();
			window.removeEventListener('beforeunload', onComponentUnmount)
		};

	},[dispatch, userData._id])

	// convert image in Buffer type to Base 64 string
    function arrayBufferToBase64(buffer) {
		var binary = '';
		var bytes = [].slice.call(new Uint8Array(buffer));
		bytes.forEach((b) => binary += String.fromCharCode(b));
		return window.btoa(binary);
	};

	// change current chat receiver
    const onReceiverChange = (receiver) => {
		// generate chatID by combining senderID and receiverID in alphabetical order
		const chatId = [userData._id, receiver._id].sort().join('-');
		// change current receiver data in redux store
        dispatch({
            type: 'SET_RECEIVER_DATA',
            payload: {
				receiverData: receiver,
				currentChatId: chatId,
			},
        })
		
		// scroll to bottom of chat area
		setTimeout(() => {
			if (containerRef.current) {
				containerRef.current.scrollTop = containerRef.current.scrollHeight;
			}
		}, 1)
    }

	// message send button click
	const sendNewMessage = (e) => {
		e.preventDefault();

		if(newMessage !== '') {
			// emit event with new message data
			socketRef.current.emit('sendMessage', { 
				sender: userData._id, 
				senderName: userData.username, 
				receiver: currentReceiver._id, 
				content: newMessage, 
				chatID: currentChatId
			})
			setNewMessage('')
		}
	}

	// get last message in a chat
	const getLastMessage = ( receiverId ) => {
		const chatId = [userData._id, receiverId].sort().join('-');
		const chatMessages = messages.filter(
			message => message.chatID === chatId
		);
		return chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : { content: '', time: '' };
	};

	// count messages with status 'unread' in chat
	const countUnreadMessages = (receiverId) => {
		const chatId = [userData._id, receiverId].sort().join('-');
		const unreadMessages = messages.filter(
			(message) => message.chatID === chatId && message.receiverStatus !== 'read' && message.sender === receiverId
		);
		return unreadMessages.length;
	}

	// user clicked delete button
	const onMessageDeleteButtonClick = (id, sender, receiver) => {
		// emit event to delete message
		socketRef.current.emit('deleteMessage', { id, sender, receiver  })
	}

	// user changed message status read/unread
	const onMessageStatusChange = (checked, message) => {
		// emit event to change message status
		socketRef.current.emit('changeMessageStatus', { checked, message })
	}

	// profile picture update button click
	const onUpdateButtonClick = () => {
		setProfileUpdateLoader(true);

		const formData = new FormData();
		formData.append('image', profilePicture);
		formData.append('id', userData._id);

		// post request for chaanging profile pic of user
		axios.post( URL + '/edit-user-profile', formData ).then((res) => {	
			if(res.data) {
				// change profile pic of user in state
				setUserData((data) => ({
					...data,
					image: (res.data.image) ? arrayBufferToBase64(res.data.image.data.data) : ''
				}))

				setProfilePicture();
				setProfileViewOverlay(false);

				toast.success('Profile updated', {
					autoClose: 1000
				});
			}
			// failed updation
			else {
				toast.error('Updation failed', {
					autoClose: 1000
				});
			}
			setProfileUpdateLoader(false);
		})
	}

	// show notification of newly arrived message
	const showNotification = (user, msg) => {
		if ('Notification' in window ) {
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					const notification = new Notification(user, {
						body: msg,
					});
					notification.onclick = () => {
						console.log('Notification clicked');
					};
				}
			});
		} else {
			console.log('Notifications not supported in this browser.');
		}
	};

	// convert timestamp to normal format ( 10:10 PM )
	const convertTime = (timestamp) => {
		const date = new Date(timestamp);
		let hours = date.getHours();
		const minutes = date.getMinutes();
		const amOrPm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12 || 12;
		const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amOrPm}`;
		return formattedTime;
	}

    return (
        <div className="user-page-main">
			<div className="user-profile-view-overlay" style={{display: `${profileViewOverlay ? 'flex' : 'none'}`}}>
			{
				(profileUpdateLoader) ? (
					<div className="loader">
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
						<div className="white"></div>
					</div>
				) : (
					<div className="user-profile-view-panel">
						<div className="user-profile-view-panel-close-button" onClick={ _ => setProfileViewOverlay(false)}>X</div>
						{
							// display image of user if exists
							(userData && userData.image) ? (
								<img 
									className="user-profile-view-panel-user-picture" 
									src={`data:${userData.image.contentType};base64,${userData.image}`} 
									alt='dp'
								/>
							) : (
								<img src='/person.jpg' className="user-profile-view-panel-user-picture" alt='person-pic'/>
							)
						}
						<label htmlFor="image" className='choose-file-button'>Choose File</label>
						<input 
							type="file" 
							accept='image/*' 
							onChange={(e)=>{ setProfilePicture(e.target.files[0])}}
							name='image' 
							id='image'
							style={{display: 'none'}}
						/>
						{
							// show name of new file picked... if picked
							profilePicture ? (
								<div className="upload-div">
									<div className="selected-file-name">
										{profilePicture.name}
									</div>
									<button className="selected-file-upload-button" onClick={onUpdateButtonClick}>Update</button>
								</div>
							) : ( <></> )
						}
					</div>
				)
			}
			</div>
            <div className="users-list">
                <div className="current-user-list-tile" style={{ order: '-1'}} key={userData._id}>
                    {
						// display profile pic of current logged user... if exists
                        (userData.image) ? (
                            <img 
                                className="current-user-list-tile-profile-pic" 
                                src={`data:${userData.image.contentType};base64,${userData.image}`} 
                                alt='profile-pic'
                                onClick={ _ => setProfileViewOverlay(true)} 
                            />
                        ) : (
                            <img 
								src='/person.jpg' 
								className="current-user-list-tile-profile-pic" 
								alt='person-pic' 
								onClick={ _ => setProfileViewOverlay(true)}
								// open profile view and update panel 
							/>
                        )
                    }
                    <div className="current-user-list-tile-username" >{userData.username}</div>
                    <div className="logout-button-div">
                        <img src="/logout.png" alt="logout" onClick={ _ => navigate('/login')} />
                    </div>
                </div>
                {
					(usersList.length === 0) ? (
						<div className="users-list-loader-container">
							<div className="loader">
								<div className="white"></div>
								<div className="white"></div>
								<div className="white"></div>
								<div className="white"></div>
							</div>
						</div>
					) : (
						usersList.map((value) => {

							// last message for that user in chat
							const lastMessage = getLastMessage(value._id);
							// number of unread messages
							const unreadCount = countUnreadMessages(value._id);

							if(value._id === userData._id) { return null }
							else if(value._id === currentReceiver._id) {
								return <div className="list-tile" style={{backgroundColor: '#404040'}} key={value._id}>
									{
										(value.status === 'online') && (
											<div className="list-tile-online-status" style={{border: '2px solid #404040'}}></div>
										)
									}
									{
										(value.image) ? (
											<img 
												className="list-tile-profile-pic" 
												src={`data:${value.image.contentType};base64,${value.image}`} 
												alt='dp'
											/>
										) : (
											<img src='/person.jpg' className="list-tile-profile-pic" alt='person-pic' />
										)
									}
									<div className="list-tile-middle-div">
										<div className="list-tile-username" >{value.username}</div>
										<div className="list-tile-last-message">{lastMessage.content}</div>
									</div>
									<div className="last-message-time-and-unread-message-div">
										{
											(lastMessage.timestamp) && (
												<div className="last-message-time" /* style={{color: `${(unreadCount!==0) ? '#00FF00' : '#FFFFFF'}`}} */>
													{ convertTime(lastMessage.timestamp) }
												</div>
											)
										}
										{
											(unreadCount !== 0) && (
												<div className="list-tile-unread-message">{unreadCount}</div>
											)
										}
									</div>
								</div>
							}
							else {
								return <div className="list-tile" onClick={ _ => onReceiverChange(value)} key={value._id}>
									{
										(value.status === 'online') && (
											<div className="list-tile-online-status" style={{border: '2px solid #272727'}}></div>
										)
									}
									{
										(value.image) ? (
											<img 
												className="list-tile-profile-pic" 
												src={`data:${value.image.contentType};base64,${value.image}`} 
												alt='dp'
											/>
										) : (
											<img src='/person.jpg' className="list-tile-profile-pic" alt='person-pic'/>
										)
									}
									<div className="list-tile-middle-div">
										<div className="list-tile-username" >{value.username}</div>
										<div className="list-tile-last-message">{lastMessage.content}</div>
									</div>
									<div className="last-message-time-and-unread-message-div">
										{
											(lastMessage.timestamp) && (
												<div className="last-message-time" /* style={{color: `${(unreadCount!==0) ? '#00FF00' : '#FFFFFF'}`}} */>
													{ convertTime(lastMessage.timestamp) }
												</div>
											)
										}
										{
											(unreadCount !== 0) && (
												<div className="list-tile-unread-message">{unreadCount}</div>
											)
										}
									</div>
								</div>
							}
						})
					)
				}
            </div>
            {
				(Object.keys(currentReceiver).length === 0 ) ? (
					<div className="welcome-div">
						<img src="/message.png" alt="msg-icon" />
					</div>
				) : (
					<div className="chat-area">
						<div className="top-bar">
							{
								(currentReceiver.image) ? (
									<img 
										className="profile-picture" 
										src={`data:${currentReceiver.image.contentType};base64,${currentReceiver.image}`} 
										alt='dp'
									/>
								) : (
									<img src='/person.jpg' className="profile-picture" alt='person-pic' />
								)
							}
							<div className="top-bar-user-data-div">
								<div className='top-bar-username'> { currentReceiver.username } </div>
								<div className='top-bar-user-status'> { currentReceiver.status } </div>
							</div>
							<div className="message-search-field-div">
								<input 
									className="message-search-field" 
									type='text'
									placeholder='Search in conversation . . .' 
									onChange={ e => setSearchText(e.target.value)}
								/>
							</div>
						</div>

						<div className="messages-area" ref={containerRef}>
						{
							messages.map((value) => {
								if(currentChatId === value.chatID && (searchText === '' || value.content.toLowerCase().includes(searchText.toLowerCase())) )
								{
									if(value.sender === userData._id) {
										return <div key={value._id} className='user-message-tile'>
											<div className="message-content">{value.content}</div>
											<div className="message-tile-bottom-row">
												<div className="message-time">
													{ convertTime(value.timestamp) }
												</div>
												<img alt='status' src={(value.receiverStatus === 'read' ? '/blue-check2.png' : 'grey-check.png')} className="mark-as-read-sender" />
											</div>
											<img src='/delete.png' alt='person' className="user-message-tile-delete-button" onClick={ _ => onMessageDeleteButtonClick(value._id, value.sender, value.receiver)} />
										</div>
									}
									else if(value.sender === currentReceiver._id) {
										return <div key={value._id} className='reciepient-message-tile' onClick={ _ => onMessageStatusChange(value.receiverStatus === 'read' ? false : true, value)} >
											<div className="message-content">{value.content}</div>
											<div className="message-tile-bottom-row">
												<div className="message-time">
													{ convertTime(value.timestamp) }
												</div>
												<input 
													type='checkbox' 
													// onChange={ e => onMessageStatusChange(e.target.checked, value)} 
													className="mark-as-read-receiver" 
													checked={value.receiverStatus === 'read'} 
													readOnly
												/>
											</div>
										</div>
									}
									else {
										return null;
									}
								}
								else {
									return null;
								}
							})
						}
						</div>

						<form className="bottom-bar" onSubmit={sendNewMessage}>
							<input
							 	type="text" 
								placeholder='Type a message . . .' 
								onChange={ e => setNewMessage(e.target.value)} 
								value={newMessage}
								autoFocus
							/>
							<button type='submit' disabled={newMessage === ''} className={newMessage === '' ? 'disabled' : ''}>
								<img src="/send.png" alt="snd" />
							</button>
						</form>
					</div>
				)
			}
        </div>
    )
}

export default User