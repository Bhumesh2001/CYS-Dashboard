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
    body('className')
        .if(body('role').equals('user')) // Only validate if role is 'user'
        .notEmpty().withMessage('ClassName is required for users')
        .isString().withMessage('ClassName must be a string')
        .trim()
        .isLength({ min: 1 }).withMessage('ClassName cannot be empty'),

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
    // Validate classId (must be a valid ObjectId and reference an existing Class)
    body('classId')
        .notEmpty().withMessage('Class ID is required')
        .isMongoId().withMessage('Class ID must be a valid ObjectId')
        .custom(async (value) => {
            const classExists = await mongoose.model('Class').findById(value);
            if (!classExists) {
                throw new Error('Class not found');
            }
            return true;
        }),

    // Validate subjectId (must be a valid ObjectId and reference an existing Subject)
    body('subjectId')
        .notEmpty().withMessage('Subject ID is required')
        .isMongoId().withMessage('Subject ID must be a valid ObjectId')
        .custom(async (value) => {
            const subjectExists = await mongoose.model('Subject').findById(value);
            if (!subjectExists) {
                throw new Error('Subject not found');
            }
            return true;
        }),

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

    // Validate categoryId (must be a valid ObjectId and reference an existing Category)
    body('categoryId')
        .notEmpty().withMessage('Category ID is required')
        .isMongoId().withMessage('Category ID must be a valid ObjectId')
        .custom(async (value) => {
            const categoryExists = await mongoose.model('Category').findById(value);
            if (!categoryExists) {
                throw new Error('Category not found');
            }
            return true;
        }),

    // Validate quizTitle
    body('quizTitle')
        .notEmpty().withMessage('Quiz title is required')
        .isLength({ min: 3, max: 255 }).withMessage('Quiz title must be between 3 and 255 characters'),

    // Validate quizTime
    body('quizTime')
        .notEmpty().withMessage('Quiz time is required')
        .isInt({ min: 1 }).withMessage('Quiz time must be a positive integer'),

    // Validate imageUrl
    body('imageUrl')
        .optional() // Allow imageUrl to be optional
        .isURL().withMessage('Image URL must be a valid URL'),

    // Validate description
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
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