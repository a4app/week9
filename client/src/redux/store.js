import { combineReducers, createStore } from "redux";
import loginReducer from "./Reducers/loginReducer";
import signupReducer from "./Reducers/signupReducer";
import chatReducer from "./Reducers/chatReducer";

const appReducers = combineReducers({
    login: loginReducer,
    signup: signupReducer,
    chat: chatReducer
})

const store = createStore(appReducers);

export default store;