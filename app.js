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

app.use(compression()); // Use compression for response bodies
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(cookieParser()); // Enable parsing of cookies
app.set('trust proxy', 1); // Trust proxy configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded form data
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded!',
})); // handle file data
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
};
app.use(cors(corsOptions)); // CORS
connectDB(); // Connect to MongoDB

// welcome message
app.get('/', (req, res) => res.send(message));

// **Routes**
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterController = require('./routes/chapterRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const questionRoutes = require('./routes/questionRoutes');
const quizRecordRoutes = require('./routes/quizRecordRoutes');
const adminSettingRoutes = require('./routes/adminSettingRoutes');
const appSettingRoutes = require('./routes/appSettingRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

// **Main routes**
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterController);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz-record', quizRecordRoutes);
app.use('/api/setting/admin-setting', adminSettingRoutes);
app.use('/api/setting/app-setting', appSettingRoutes);
app.use('/api/permissions', permissionRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server.`);
    err.statusCode = 404;
    next(err);
});

// Centralized error handler
app.use((err, req, res, next) => errorHandler(err, req, res, next));

// Cluster for multi-core CPUs
if (cluster.isMaster) {
    const numWorkers = os.cpus().length;
    console.log(`Master process is running with PID: ${process.pid}`);
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    };
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        setTimeout(() => cluster.fork(), 5000);
    });
} else {
    // Worker processes have an HTTP server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
    });
};

// Export the app for use in other modules
module.exports = app;
