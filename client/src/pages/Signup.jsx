import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../css/signup.css';
import axios from 'axios';

const URL = 'https://chat-app-server-pi2x.onrender.com';

const Signup = () => {

	const history = useNavigate();
	const dispatch = useDispatch();

	const { buttonLoading } = useSelector((state) => state.signup)

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [conPassword, setConPassword] = useState('');

	// input fields focus flags
	const [usernameFocus, setUsernameFocus] = useState(false);
	const [passwordFocus, setPasswordFocus] = useState(false);
	const [conPasswordFocus, setConPasswordFocus] = useState(false);

	const [errorMessages, setErrorMessages] = useState({ username: '', password: '', conPassword: '', })

	const onsignupFormSubmit = (e) => {
		e.preventDefault();

		dispatch({
			type: 'SET_LOADING',
			payload: true
		})
		
		axios.post( URL + '/signup', { username, password, conPassword }).then((res) => {

			// succesfull signup
			if(res.status === 200) {
				toast.success('Signup succesfull', {
					pauseOnHover: false,
					autoClose: 2000
				})
				setErrorMessages({ username: '', password: '', conPassword: '', })
				history('/login')
			}

			dispatch({
                type: 'SET_LOADING',
                payload: false
            })

		}).catch((err) => {
			
			// bad request...validation failed
			if(err.response.status === 400) {
				setErrorMessages(err.response.data)
			}
			// conflict request.... username duplicate key error
			else if(err.response.status === 409) {
				setErrorMessages({ username: '', password: '', conPassword: '', });
				toast.error('Username already exists')
			}
			// server error
			else if(err.response.status === 500) {
				toast.error('Someting went wrong')
			}

			dispatch({
                type: 'SET_LOADING',
                payload: false
            })
			
			console.log(err);
		})

	}

	return (
		<div className="signup-page-main">
			<form className="signup-page-form-div" onSubmit={onsignupFormSubmit}>
				<div className="signup-form-head">Signup</div>
				<div className={`signup-form-input-field-div ${usernameFocus || username ? 'focused' : ''}`}>
					<label>Username</label>
					<input
						type="text"
						onFocus={ _ => setUsernameFocus(true)} 
						onBlur={ _ => setUsernameFocus(false)} 
						onChange={ e => setUsername(e.target.value)} 
					/>
					<div className="signup-form-error-message">{errorMessages.username}</div>
				</div>
				<div className={`signup-form-input-field-div ${passwordFocus || password ? 'focused' : ''}`}>
					<label>Password</label>
					<input
						type="password"
						onFocus={ _ => setPasswordFocus(true)}
						onBlur={ _ => setPasswordFocus(false)} 
						onChange={ e => setPassword(e.target.value)} 
					/>
					<div className="signup-form-error-message">{errorMessages.password}</div>
				</div>
				<div className={`signup-form-input-field-div ${conPasswordFocus || conPassword ? 'focused' : ''}`}>
					<label>Confirm</label>
					<input
						type="password"
						onFocus={ _ => setConPasswordFocus(true)}
						onBlur={ _ => setConPasswordFocus(false)} 
						onChange={ e => setConPassword(e.target.value)} 
					/>
					<div className="signup-form-error-message">{errorMessages.conPassword}</div>
				</div>
				<button
					className={`signup-form-submit-button ${buttonLoading ? 'loading-signup-button' : ''} `}
					type='Submit'
				>Signup</button>
				<div className="dont-have-an-account-div" onClick={_ => history('/login')}>
					already have an account ? &nbsp;
					<span style={{ fontWeight: '700', fontSize: '15px' }}>Login</span>
				</div>
			</form>
		</div>
	)
}

export default Signup