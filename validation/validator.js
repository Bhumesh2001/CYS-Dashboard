const { body } = require('express-validator');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question'); // Assuming Question model is defined here

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
            if (req.file) { // Check if file exists
                const imageFile = req.file;
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                const maxSize = 50 * 1024 * 1024; // 50MB file size limit

                if (!allowedTypes.includes(imageFile.mimetype)) {
                    throw new Error('Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.');
                }
                if (imageFile.size > maxSize) {
                    throw new Error('File is too large. Maximum allowed size is 50MB.');
                }
            }
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
        .optional()
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
        .isIn(['Options', 'True/False', 'Short Answer', 'Guess Word', 'Fill in the Blanks'])
        .withMessage('Invalid question type'),

    // Validate options (for 'Options' question type)
    body('options')
        .if(body('questionType').equals('Options'))
        .notEmpty().withMessage('Options are required for "Options" question type')
        .isObject().withMessage('Options must be an object with keys a, b, c, d'),

    // Validate answer
    body('answer')
        .notEmpty().withMessage('Answer is required')
        .isString().withMessage('Answer must be a string'),

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
    body('reason')
        .isString()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Reason must be a string with at least 10 characters'),
];

// submit quiz validation 
exports.validateQuizSubmissionRule = [
    // Validate userId - required and should be a valid MongoDB ObjectId
    body('userId')
        .notEmpty().withMessage('userId is required')
        .isMongoId().withMessage('Invalid userId format'),

    // Validate quizId - required and should be a valid MongoDB ObjectId
    body('quizId')
        .notEmpty().withMessage('quizId is required')
        .isMongoId().withMessage('Invalid quizId format'),

    // Validate userAnswers
    body('userAnswers')
        .notEmpty().withMessage('userAnswers are required')
        .isArray().withMessage('userAnswers must be an array')
        .custom(async (value, { req }) => {
            // Step 1: Fetch the quiz using quizId
            const quiz = await Quiz.findById(req.body.quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            // Step 2: Ensure the quiz has a valid chapterId
            const chapterId = quiz.chapterId; // Assuming `chapterId` exists in the Quiz model
            if (!chapterId) {
                throw new Error('Quiz does not have a valid chapterId');
            }

            // Step 3: Fetch all questions for the chapter
            const questions = await Question.find({ chapterId });
            if (!questions || questions.length === 0) {
                throw new Error('No questions found for the specified chapter');
            }

            // Step 4: Validate the length of userAnswers
            const questionCount = questions.length;
            if (value.length !== questionCount) {
                throw new Error(
                    `userAnswers should contain exactly ${questionCount} answers. You provided ${value.length}.`
                );
            }

            return true;
        }),
];

// admin general setting validation
exports.validateGeneralSettingsRule = [
    body('siteName')
        .isLength({ min: 3, max: 100 })
        .withMessage('Site Name must be 3-100 characters long.'),

    (req, res, next) => {
        if (!req.files || !req.files.siteLogo) {
            return res.status(400).json({ success: false, message: 'Site Logo file is required.' });
        }
        next();
    },
];

// admin smtp setting rule
exports.validateSmtpSettingsRule = [
    body('smtpType')
        .isIn(['Gmail', 'Outlook', 'Custom', "SMTP"])
        .withMessage('Invalid SMTP Type.'),

    body('smtpHost')
        .notEmpty()
        .withMessage('SMTP Host is required.'),

    body('smtpEmail')
        .isEmail()
        .withMessage('Invalid SMTP Email.'),

    body('smtpPassword')
        .isLength({ min: 8 })
        .withMessage('SMTP Password must be at least 8 characters long.'),

    body('smtpSecure')
        .notEmpty()
        .withMessage('SMTP Secure is required!'),

    body('smtpPort')
        .isInt({ min: 1, max: 65535 })
        .withMessage('SMTP Port must be between 1 and 65535.'),
];

//app settting validation
exports.validateAppGeneralSettingsRule = [
    // Validate email - required and should be a valid email address
    body('email')
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Invalid email format.'),

    // Validate author - required and should be a string
    body('author')
        .notEmpty()
        .withMessage('Author is required.')
        .isString()
        .withMessage('Author must be a string.'),

    // Validate contact - required and should be a valid phone number (you can use a regex for validation)
    body('contact')
        .notEmpty()
        .withMessage('Contact is required.')
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid contact number format.'),  // Matches international phone numbers

    // Validate website - required and should be a valid URL
    body('website')
        .notEmpty()
        .withMessage('Website is required.')
        .isURL()
        .withMessage('Invalid website URL.'),

    // Validate developerBy - required and should be a string
    body('developerBy')
        .notEmpty()
        .withMessage('Developer By is required.')
        .isString()
        .withMessage('Developer By must be a string.'),

    // Validate description - required and should be a string
    body('_description')
        .notEmpty()
        .withMessage('Description is required.')
        .isString()
        .withMessage('Description must be a string.')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description should be between 10 and 500 characters long.'),
];

// validte app setting
exports.validateAppSettingRule = [
    body('rtl')
        .isBoolean()
        .withMessage('RTL must be a boolean value.')
        .notEmpty()
        .withMessage('RTL is required.'),
    body('appMaintenance')
        .isBoolean()
        .withMessage('App Maintenance must be a boolean value.')
        .notEmpty()
        .withMessage('App Maintenance is required.'),
    body('googleLogin')
        .isBoolean()
        .withMessage('Google Login must be a boolean value.')
        .notEmpty()
        .withMessage('Google Login is required.'),
    body('firstOpenLogin')
        .isBoolean()
        .withMessage('First Open Login must be a boolean value.')
        .notEmpty()
        .withMessage('First Open Login is required.'),
    body('screenshotBlock')
        .isBoolean()
        .withMessage('Screenshot Block must be a boolean value.')
        .notEmpty()
        .withMessage('Screenshot Block is required.'),
    body('vpnBlock')
        .isBoolean()
        .withMessage('VPN Block must be a boolean value.')
        .notEmpty()
        .withMessage('VPN Block is required.'),
];

// validate privacy policy
exports.validatePrivacyPolicyRule = [
    body('policy')
        .notEmpty()
        .withMessage('Policy is required.')
        .isString()
        .withMessage('Policy must be a string.'),
];

// validate temrs 
exports.validateTermsRule = [
    body('terms')
        .notEmpty()
        .withMessage('Terms and Conditions are required.')
        .isString()
        .withMessage('Terms and Conditions must be a string.'),
];

// validate notifiction
exports.validateNotificationRule = [
    body('oneSignalAppId')
        .notEmpty()
        .withMessage('OneSignal App ID is required.')
        .isString()
        .withMessage('OneSignal App ID must be a string.'),
    body('oneSignalAppKey')
        .notEmpty()
        .withMessage('OneSignal App Key is required.')
        .isString()
        .withMessage('OneSignal App Key must be a string.'),
];

// validate App update 
exports.validateAppUpdateRule = [
    body('onOff')
        .isBoolean()
        .withMessage('On/Off must be a boolean value.')
        .notEmpty()
        .withMessage('On/Off is required.'),
    body('newAppVersion')
        .notEmpty()
        .withMessage('New App Version is required.')
        .isString()
        .withMessage('New App Version must be a string.'),
    body('description_')
        .notEmpty()
        .withMessage('Description is required.')
        .isString()
        .withMessage('Description must be a string.'),
    body('appLink')
        .notEmpty()
        .withMessage('App Link is required.')
        .isURL()
        .withMessage('App Link must be a valid URL.'),
];
