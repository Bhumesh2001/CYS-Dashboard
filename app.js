const express = require('express');
const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require("path");

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddle');
const { message } = require('./utils/message');
const { helmetConfig } = require('./config/configure');

dotenv.config();
const app = express();

// middlewares
app.use(compression());
app.use(helmet.contentSecurityPolicy(helmetConfig));
app.use(xss());
app.use(cookieParser());

app.set('trust proxy', 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, status: 429, message: 'Too many requests, Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/admin/login', limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded!',
}));

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => res.send(message));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Setting up main routes
app.use("/admin", require("./routes/pageRoutes"));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/chapters', require('./routes/chapterRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/quiz-record', require('./routes/quizRecordRoutes'));
app.use('/api/setting/admin-setting', require('./routes/adminSettingRoutes'));
app.use('/api/setting/app-setting', require('./routes/appSettingRoutes'));

app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server.`);
    err.statusCode = 404;
    next(err);
});

app.use((err, req, res, next) => errorHandler(err, req, res, next));

if (cluster.isMaster) {
    const numWorkers = os.cpus().length;
    console.log(`Master process is running with PID: ${process.pid}`);

    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    };

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        setTimeout(() => cluster.fork(), 5000); // Restart the worker
    });
} else {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
    });
};

module.exports = app;
