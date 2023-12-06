const express = require("express");
const router = express.Router();

const Models = require('../mongo_db/models');
const UserModel = Models.user;

// user login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // validate credentials
    if(username === '' || password === '') {
        const out = {username: '', password: ''};
        if(username === '')
            out.username = 'required *';
        if(password === '')
            out.password = 'required *';

        // validation failed... bad request
        return res.status(400).json(out);
    }
    else {
        try {
            const user = await UserModel.findOne({username: username, password: password});
            return user ? 
            res.status(200).json(user) : // succesfull login .. OK
            res.status(401).json({username: 'incorrect username or password', password: ''}); // credentials mismatch.. unautherized
        }
        catch(e) {
            console.log(e);
            // server error
            return res.status(500).json(e);
        }
    }
})

module.exports = router;