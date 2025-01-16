const nodemailer = require('nodemailer');
const { EMAIL, EMAIL_PASSWORD } = process.env;
const { otpHtmlTemplate, welcomeMessage } = require('../utils/message');

// **Transporter with Connection Pooling and TLS**
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // or 'STARTTLS'
    service: 'Gmail',
    pool: true, // Enables connection pooling
    maxConnections: 5, // Maximum simultaneous connections
    rateLimit: 10, // Max messages per second
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// **Send OTP with Error Handling and Logging**
exports.sendOTP = async (email, otp) => {
    const mailOptions = {
        to: email,
        from: EMAIL,
        subject: '🔑 Reset Your Password - CYS App',
        html: otpHtmlTemplate(otp),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Failed to send OTP to ${email}:`, error);
    };
};

// **Send OTP with Error Handling and Logging**
exports.sendWelcomeMessage = async (email, name) => {
    const mailOptions = {
        to: email,
        from: EMAIL,
        subject: "👋 Thank You for Joining CYS! Let's Get Started",
        html: welcomeMessage(name),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Failed to send OTP to ${email}:`, error);
    };
};