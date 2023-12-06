const express = require('express');
const router = express.Router();

const Models = require('../mongo_db/models');
const UserModel = Models.user;

router.post('/signup', async (req, res) => {
    const { username, password, conPassword } = req.body;
    // validate input data
    if(username === '' || password === '' || conPassword === '' || password !== conPassword) {
        const out = { username: '', password: '', conPassword: '' }
        if(username === '')
            out.username = 'required *';
        
        if(password === '')
            out.password = 'required *';

        if(password !== '' && password !== conPassword)
            out.conPassword = 'not matching !';

        if(conPassword === '')
            out.conPassword = 'required *';

        // validation failed... bad request
        return res.status(400).json(out);
    }
    else {
        try {
            const newUser = new UserModel({ 
                username: username,
                password: password ,
                status: '..'
            })
            await newUser.save();
            // succesfull signup ... OK
            return res.status(200).send(true);
        }
        catch(err) {
            console.log(err);
            // username already exists .. conflict request
            if(err.code === 11000) {
                return res.status(409).send(err); 
            }
            // server error
            else {
                return res.status(500).send(err)
            }
        }
    }
})

module.exports = router;