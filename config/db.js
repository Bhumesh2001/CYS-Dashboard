const mongoose = require('mongoose');
const dotenv = require('dotenv');

// **Load env variables**
dotenv.config();

// **Connect to mongodb**
exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Wait up to 30s for DB connection
            socketTimeoutMS: 45000, // Increase query timeout
            maxPoolSize: 10, // Allow multiple concurrent connections
        });
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process if DB connection fails
    }
};
