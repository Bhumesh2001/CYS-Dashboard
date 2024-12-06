const mongoose = require('mongoose');
const dotenv = require('dotenv');

// **Load env variables**
dotenv.config();

// **Connect to mongodb**
exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
