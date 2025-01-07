const express = require('express');
const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddle');
const { message } = require('./utils/message');

dotenv.config();
const app = express();

// Middleware for response compression
app.use(compression());

// Security middleware to set HTTP headers
app.use(helmet());

// Middleware to sanitize user input and prevent XSS attacks
app.use(xss());

// Middleware to parse cookies
app.use(cookieParser());

// Trust proxy configuration for rate limiting
app.set('trust proxy', 1);

// Rate limiting middleware to limit requests per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to handle file uploads
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded!',
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Welcome message route
app.get('/', (req, res) => res.send(message));

// Importing route modules
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const questionRoutes = require('./routes/questionRoutes');
const quizRecordRoutes = require('./routes/quizRecordRoutes');
const adminSettingRoutes = require('./routes/adminSettingRoutes');
const appSettingRoutes = require('./routes/appSettingRoutes');

// Setting up main routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz-record', quizRecordRoutes);
app.use('/api/setting/admin-setting', adminSettingRoutes);
app.use('/api/setting/app-setting', appSettingRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server.`);
    err.statusCode = 404;
    next(err);
});

// Centralized error handling middleware
app.use((err, req, res, next) => errorHandler(err, req, res, next));

// Set up clustering for multi-core CPU support
if (cluster.isMaster) {
    const numWorkers = os.cpus().length;
    console.log(`Master process is running with PID: ${process.pid}`);

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    };

    // Handle worker exit and restart
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        setTimeout(() => cluster.fork(), 5000); // Restart the worker
    });
} else {
    // Start the server on worker processes
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
    });
};

// Export the app for testing or other uses
module.exports = app;
