const express = require('express');
const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');
const compression = require('compression');
const helmet = require('helmet');
const xss = require('xss-clean');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddle');

dotenv.config();
const app = express();

// Use compression for response bodies
app.use(compression());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Enable parsing of cookies
app.use(cookieParser());

// Initialize CSRF Protection Middleware
const csrfProtection = csrf({ cookie: true });

// Trust proxy configuration
app.set('trust proxy', 1); // Trust first proxy

// Rate Limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Use JSON parsing middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes for obtaining CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.status(200).json({ csrfToken: req.csrfToken() });
});

// **Routes**
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterController = require('./routes/chapterRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Apply CSRF protection to state-changing routes
app.use(csrfProtection);

// Main routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterController);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server.`);
    err.statusCode = 404;
    next(err);
});

// Centralized error handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    errorHandler(err, req, res, next);
});

// Cluster for multi-core CPUs
if (cluster.isMaster) {
    const numWorkers = os.cpus().length;

    console.log(`Master process is running with PID: ${process.pid}`);

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    // Worker processes have an HTTP server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
    });
};
