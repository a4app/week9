
let initialState = {
    usersList: [],
    currentReceiver: {},
    currentChatId: '',
    messages: []
};

const chatReducer = (state = initialState, action) => {
    
    switch (action.type) {

        // set all users data... on login
        case 'SET_USERS_DATA': return {
            ...state,
            usersList: action.payload
        }

        // set current receiver data.. on receiver change
        case 'SET_RECEIVER_DATA': return {
            ...state,
            currentReceiver: action.payload.receiverData,
            currentChatId: action.payload.currentChatId
        }

        // set all messages list.. on login... from api call
        case 'SET_ALL_MESSAGES': return {
            ...state,
            messages: action.payload
        }

        // set online status for all online users... on login.... from socket
        case 'SET_ALL_ONLINE_USERS': return {
            ...state,
            usersList: state.usersList.map((user) => ({
                ...user,
                status: action.payload.includes(user._id) ? 'online' : user.status
            }))
        }

        // add new message to messages list... socket event
        case 'ADD_NEW_MESSAGE': return {
            ...state,
            messages: [...state.messages, action.payload]
        }

        // change user status online/last seen... socket event
        case 'UPDATE_USER_STATUS': return {
            ...state,
            usersList: state.usersList.map((user) =>
                user._id === action.payload.userId ? { ...user, status: action.payload.status } : user
            ),
            // change status of current receiver... if exists
            currentReceiver: state.currentReceiver && state.currentReceiver._id ? {
                ...state.currentReceiver,
                status: state.currentReceiver._id === action.payload.userId ? action.payload.status : state.currentReceiver.status
            } : state.currentReceiver
        };

        // delete one message in messages list... socket event
        case 'DELETE_MESSAGE': return {
            ...state,
            messages: state.messages.filter((message) => message._id !== action.payload),
        };

        // update message status read/unread... socket event
        case 'UPDATE_MESSAGE_STATUS': return {
            ...state,
            messages: state.messages.map((msg) =>
                msg._id === action.payload.id ? { ...msg, receiverStatus: action.payload.status } : msg
            ),
        };

        default:
            return state;
    }
};

export default chatReducer;