const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);
		console.log('Connected to MongoDB');
		return true;
	}
	catch(error) {
		console.error('Mongoose connection error:', error);
		return false;
	}
};

module.exports = connectDB