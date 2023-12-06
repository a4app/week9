const express = require('express');
const connectDB = require(__dirname + '/mongo_db/db_connect.js');
const cors = require('cors');
const http = require('http');
const initializeWebSocket = require('./socket/socket');
const { ObjectId } = require('mongodb');

const Models = require('./mongo_db/models');
const UserModel = Models.user;

const loginRoute = require('./routes/loginRoute');
const signupRoute = require('./routes/signupRoute');
const chatRoute = require('./routes/chatRoute');

const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const multer = require('multer');

// storage configuration
const storage = multer.diskStorage({
    destination: 'images',
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
});
// multer instance
const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = initializeWebSocket(server);

app.use(loginRoute)
app.use(signupRoute)
app.use(chatRoute)

// connect to mongodb
connectDB();


/*---------------------------------------------------------------------------*/
// to edit user profile picture
app.post('/edit-user-profile', upload.single('image'), async (req, res) => {
    const { id } = req.body;
    try {
        const updatedData = await UserModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { image: {
                data: fs.readFileSync('./images/' + req.file.originalname),
                contentType: req.file.mimetype,
            }, } },
            {new: true}
        );

        // succesfull updation
        return res.send(updatedData)
    }
    catch(err) {
        console.log(err);
        return res.send(false);
    }
})
/*---------------------------------------------------------------------------*/

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
    console.log('server is started');
});