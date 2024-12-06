const { body } = require('express-validator');
const mongoose = require('mongoose');

// **Rgister validation rules**
exports.registerValidationRules = [
    // validate fullname
    body('fullName')
        .notEmpty()
        .withMessage('fullName is required.')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters.')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain alphabets and spaces.'),

    // Validate email
    body('email')
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Invalid email address.')
        .normalizeEmail(),

    // Validate mobile
    body('mobile')
        .notEmpty()
        .withMessage('Mobile is required.')
        .trim()
        .matches(/^\d{10}$/)
        .withMessage('Mobile must be a valid 10-digit number.'),

    // Validate password
    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password must contain at least one letter, one number, and may include special characters.'
        ),

    // Validate confirmPassword
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),

    // Validate class
    body('class')
        .if(body('role').equals('user')) // Only validate if role is 'user'
        .notEmpty().withMessage('Class is required for users')
        .isString().withMessage('Class must be a string')
        .trim()
        .isLength({ min: 1 }).withMessage('Class cannot be empty'),

    // Validate profileUrl
    body('profileUrl')
        .optional()
        .isURL()
        .withMessage('Profile URL must be a valid URL.'),

    // Validate role
    body('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be either "admin" or "user".'),
];

// **login Validation rule**
exports.loginValidationRules = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
];

// **Quiz validation rules**
exports.quizValidationRules = [
    // Validate chapterId (must be a valid ObjectId and reference an existing Chapter)
    body('chapterId')
        .notEmpty().withMessage('Chapter ID is required')
        .isMongoId().withMessage('Chapter ID must be a valid ObjectId')
        .custom(async (value) => {
            const chapterExists = await mongoose.model('Chapter').findById(value);
            if (!chapterExists) {
                throw new Error('Chapter not found');
            }
            return true;
        }),

    // Validate question
    body('question')
        .notEmpty().withMessage('Question is required')
        .isLength({ min: 5 }).withMessage('Question must be at least 5 characters long')
        .isLength({ max: 1000 }).withMessage('Question cannot exceed 1000 characters')
        .trim(),

    // Validate options (ensure exactly 4 options)
    body('options')
        .notEmpty().withMessage('Options are required')
        .isArray({ min: 4, max: 4 }).withMessage('There must be exactly 4 options')
        .bail()
        .custom((value) => {
            const validOptions = value.every((option) => typeof option === 'string');
            if (!validOptions) {
                throw new Error('Each option must be a string');
            }
            return true;
        }),

    // Validate answer (should match one of the options)
    body('answer')
        .notEmpty().withMessage('Answer is required')
        .isString().withMessage('Answer must be a string')
        .bail()
        .custom((value, { req }) => {
            if (!req.body.options.includes(value)) {
                throw new Error('Answer must match one of the provided options');
            }
            return true;
        }),
];

// **Validate login user field**
exports.validateResetPasswordRules = [
    // Email Validation
    body('email')
        .isEmail().withMessage('Please enter a valid email address')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),

    // Password Verification
    body('newPassword')
        .notEmpty().withMessage('newPassword is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage('Password must contain at least one letter, one number, and one special character'),
];

// **Validate Email**
exports.validateEmailRules = [
    // Email verification
    body('email')
        .isEmail().withMessage('Please enter a valid email address')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),
];

// **Validate email and otp**
exports.validateEmailAndOtpRules = [
    // Email verification
    body('email')
        .isEmail().withMessage('Please enter a valid email address')
        .notEmpty().withMessage('Email is required')
        .normalizeEmail(),

    // OTP Validation
    body('otp')
        .notEmpty().withMessage('OTP is required')
        .isString().withMessage('OTP must be a string')
        .trim(),
];

// **Validate notification field**
exports.notificationValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required.')
        .isLength({ max: 100 }).withMessage('Title must be less than 100 characters.'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required.')
        .isLength({ max: 500 }).withMessage('Message must be less than 500 characters.'),
    body('userIds')
        .notEmpty().withMessage('User IDs are required.')
        .custom((value) => value === 'all' || Array.isArray(value))
        .withMessage('User IDs must be "all" or an array of IDs.'),
    body('imageUrl')
        .optional()
        .isURL().withMessage('Invalid image URL.'),
];