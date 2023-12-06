import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../css/login.css';
import axios from 'axios';

const URL = 'https://chat-app-server-pi2x.onrender.com';

const Login = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // get button state from redux store
    const { buttonLoading } = useSelector((state) => state.login);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // input fields focus flags
    const [usernameFocus, setUsernameFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    
    // error messages
	const [errorMessage, setErrorMessage] = useState({ username: '', password: '' });


    const onLoginFormSubmit = (e) => {
        e.preventDefault();

        dispatch({
            type: 'SET_LOADING',
            payload: true
        })

        axios.post( URL + '/login', { username, password }).then((res) => {
            // succesfull login
            if(res.status === 200) {
                toast.success('Login succesfull', {
                    autoClose: 1000,
                    pauseOnHover: false
                });

                dispatch({
                    type: 'SET_LOADING',
                    payload: false
                })

                // goto user chat page
                navigate('/user', { state: res.data })
            }
            
        }).catch((err) => {
            // bad request... validation failed
            if(err.response.status === 400) {
                setErrorMessage(err.response.data)
            }
            // server error occured
            else if(err.response.status === 500) {
                console.log(err.response.data);
                toast.error('Error ocuured');
            }
            // unauthariaed... username or password mismatch
            else if(err.response.status === 401) {
                setErrorMessage(err.response.data)
            }
            
            dispatch({
                type: 'SET_LOADING',
                payload: false
            })
        })

        
    }

    return (
        <div className="login-page-main">
            <form className="login-page-form-div" onSubmit={onLoginFormSubmit}>
                <div className="login-form-head">Login</div>
                <div className={`login-form-input-field-div ${usernameFocus || username ? 'focused' : ''}`}>
                    <label>Username</label>
                    <input 
                        type="text" 
                        onFocus={ _ => setUsernameFocus(true)}
                        onBlur={ _ => setUsernameFocus(false)} 
                        onChange={ e => setUsername(e.target.value) }
                    />
                    <div className="login-form-error-message">{errorMessage.username}</div>
                </div>
                <div className={`login-form-input-field-div ${passwordFocus || password ? 'focused' : ''}`}>
                    <label>Password</label>
                    <input 
                        type="password" 
                        onFocus={ _ => setPasswordFocus(true)}
                        onBlur={ _ => setPasswordFocus(false)} 
                        onChange={ e => setPassword(e.target.value) }
                    />
                    <div className="login-form-error-message">{errorMessage.password}</div>
                </div>
                <input 
                    className={`login-form-submit-button ${buttonLoading ? 'loading-login-button' : ''}`} 
                    type='submit' 
                    value='Login'
                />
                <div className="dont-have-an-account-div" onClick={ _ => navigate('/signup')}>
                    don't have an account ? &nbsp;
                    <span style={{fontWeight: '700', fontSize: '15px'}}>Signup</span>
                </div>
            </form>
        </div>
    )
}

export default Login