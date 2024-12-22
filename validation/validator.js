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
    body('classId')
        .if(body('role').equals('user')) // Only validate if role is 'user'
        .notEmpty().withMessage('ClassId is required for users') // Ensure the field is not empty
        .isMongoId().withMessage('ClassId must be a valid MongoDB ObjectId') // Validate as MongoDB ObjectId
        .trim(), // Remove extra spaces

    // Validate profileUrl
    body('profileUrl')
        .optional()
        .custom((value, { req }) => {
            // Check if there's no file uploaded
            if (!req.files || !req.files.imageUrl) {
                throw new Error('Image file is required');
            };

            const imageFile = req.files.imageUrl;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 50 * 1024 * 1024; // 50MB file size limit

            // Check the file type
            if (!allowedTypes.includes(imageFile.mimetype)) {
                throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            };

            // Check the file size
            if (imageFile.size > maxSize) {
                throw new Error('File is too large. Maximum allowed size is 50MB.');
            };

            return true;
        }),

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
        .isLength({ min: 3, max: 255 })
        .withMessage('Quiz title must be between 3 and 255 characters'),

    // Validate quizTime
    body('quizTime')
        .notEmpty().withMessage('Quiz time is required')
        .isInt({ min: 1 })
        .withMessage('Quiz time must be a positive integer'),

    // Validate imageUrl
    body('imageUrl')
        .custom((value, { req }) => {
            // Check if there's no file uploaded
            if (!req.files || !req.files.imageUrl) {
                throw new Error('Image file is required');
            };

            const imageFile = req.files.imageUrl;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 50 * 1024 * 1024; // 50MB file size limit

            // Check the file type
            if (!allowedTypes.includes(imageFile.mimetype)) {
                throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            };

            // Check the file size
            if (imageFile.size > maxSize) {
                throw new Error('File is too large. Maximum allowed size is 50MB.');
            };

            return true;
        }),

    // Validate description
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
];

// validate class field
exports.classValidationRule = [
    // Validate name
    body('name')
        .notEmpty().withMessage('Class name is required')
        .isLength({ min: 2 }).withMessage('Class name must be at least 2 characters long')
        .isLength({ max: 50 }).withMessage('Class name must be less than 50 characters')
        .trim(),

    // Validate description
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
        .trim(),

    // Validate status
    body('status')
        .optional()
        .isIn(['Active', 'Inactive']).withMessage('Invalid status value'),

];

// chapter validation rule
exports.chapterValidationRule = [
    // Validate subjectId
    body('subjectId')
        .notEmpty().withMessage('Subject ID is required')
        .isMongoId().withMessage('Invalid Subject ID'),

    // Validate name
    body('name')
        .notEmpty().withMessage('Chapter name is required')
        .isLength({ min: 2 }).withMessage('Chapter name must be at least 2 characters long')
        .isLength({ max: 200 }).withMessage('Chapter name must be less than 200 characters')
        .trim(),

    // Validate description (optional)
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
        .trim(),

    // Validate imageUrl
    body('imageUrl')
        .custom((value, { req }) => {
            // Check if there's no file uploaded
            if (!req.files || !req.files.imageUrl) {
                throw new Error('Image file is required');
            };

            const imageFile = req.files.imageUrl;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 50 * 1024 * 1024; // 50MB file size limit

            // Check the file type
            if (!allowedTypes.includes(imageFile.mimetype)) {
                throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            };

            // Check the file size
            if (imageFile.size > maxSize) {
                throw new Error('File is too large. Maximum allowed size is 50MB.');
            };

            return true;
        }),

    // Validate status (optional)
    body('status')
        .optional()
        .isIn(['Active', 'Inactive']).withMessage('Invalid status value'),
];

// question validation rule
exports.questionValidationRule = [
    // Validate categoryId
    body('categoryId')
        .notEmpty().withMessage('Category ID is required')
        .isMongoId().withMessage('Invalid Category ID format'),

    // Validate chapterId
    body('chapterId')
        .notEmpty().withMessage('Chapter ID is required')
        .isMongoId().withMessage('Invalid Chapter ID format'),

    // Validate question
    body('question')
        .notEmpty().withMessage('Question is required')
        .isString().withMessage('Question must be a string')
        .isLength({ min: 5 }).withMessage('Question must be at least 5 characters long')
        .isLength({ max: 500 }).withMessage('Question must be less than 500 characters')
        .trim(),

    // Validate questionType
    body('questionType')
        .notEmpty().withMessage('Question type is required')
        .isIn(['Options', 'True/False', 'Short Answer', 'Guess Word'])
        .withMessage('Invalid question type'),

    // Validate options (only for 'Options' type questions)
    body('options')
        .if(body('questionType').equals('Options'))
        .notEmpty().withMessage('Options are required for "Options" question type')
        .isArray({ min: 2, max: 10 }).withMessage('Options must be an array with 2-10 items')
        .custom((options) => {
            if (options.some(option => typeof option !== 'string' || option.trim() === '')) {
                throw new Error('Each option must be a non-empty string');
            }
            return true;
        }),

    // Validate answer
    body('answer')
        .notEmpty().withMessage('Answer is required')
        .isString().withMessage('Answer must be a string')
        .custom((answer, { req }) => {
            if (req.body.questionType === 'Options' && !req.body.options.includes(answer)) {
                throw new Error('Answer must be one of the provided options');
            }
            return true;
        }),

    // Validate status (optional)
    body('status')
        .optional()
        .isIn(['Active', 'Inactive']).withMessage('Invalid status value'),
];

// subjectValidation rule
exports.subjectValidationRule = [
    // Validate classId
    body('classId')
        .notEmpty().withMessage('Class ID is required')
        .isMongoId().withMessage('Invalid Class ID format'),

    // Validate name
    body('name')
        .notEmpty().withMessage('Subject name is required')
        .isString().withMessage('Subject name must be a string')
        .isLength({ min: 2 }).withMessage('Subject name must be at least 2 characters long')
        .isLength({ max: 100 }).withMessage('Subject name must be less than 100 characters')
        .trim(),

    // Validate description
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
        .trim(),

    // Validate imageUrl
    body('imageUrl')
        .custom((value, { req }) => {
            // Check if there's no file uploaded
            if (!req.files || !req.files.imageUrl) {
                throw new Error('Image file is required');
            };

            const imageFile = req.files.imageUrl;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 50 * 1024 * 1024; // 50MB file size limit

            // Check the file type
            if (!allowedTypes.includes(imageFile.mimetype)) {
                throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            };

            // Check the file size
            if (imageFile.size > maxSize) {
                throw new Error('File is too large. Maximum allowed size is 50MB.');
            };

            return true;
        }),

    // Validate status (optional)
    body('status')
        .optional()
        .isIn(['Active', 'Inactive']).withMessage('Invalid status value'),
];

// report validation rule
exports.reportValidationRule = [
    body('reportedId')
        .isMongoId()
        .withMessage('Reported ID must be a valid MongoDB ObjectId'),
    body('reportedModel')
        .isIn(['Chapter', 'Product', 'User']) // Adjust the allowed models as per your app
        .withMessage('Reported Model must be one of the allowed models'),
    body('reporterId')
        .isMongoId()
        .withMessage('Reporter ID must be a valid MongoDB ObjectId'),
    body('reason')
        .isString()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Reason must be a string with at least 10 characters'),
];
