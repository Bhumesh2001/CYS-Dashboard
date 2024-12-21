const express = require('express');
const router = express.Router();

// **Controller**
const userController = require('../controllers/authController');

// **Validation**
const userValidation = require('../validation/validator');
const { validateFields } = require('../middlewares/validateMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');

// **Authentication and authorization**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");

// **Register**
router.post(
    '/register',
    validateFields(userValidation.registerValidationRules),
    userController.register
);

// **Login**
router.post(
    '/login',
    validateFields(userValidation.loginValidationRules),
    userController.login
);

// **Forgot password**
router.post(
    '/forgot-password',
    validateFields(userValidation.validateEmailRules),
    userController.forgotPassword
);

// **Verify reset password otp**
router.post(
    '/verify-otp',
    validateFields(userValidation.validateEmailAndOtpRules),
    userController.verifyOtp
);

// **Reset Password**
router.post(
    '/reset-password',
    validateFields(userValidation.validateResetPasswordRules),
    userController.resetPassword
);

// **Get profile and update profile**
router.route('/profile')
    .get(authenticate, authorize(['admin', 'user']), cacheMiddleware, userController.getProfile)
    .put(authenticate, authorize(['admin', 'user']), userController.updateProfile)

// **Logout**
router.post('/logout', userController.logout);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Admin only
 */
router.post(
    '/user',
    authenticate,
    authorize(['admin']),
    validateFields(userValidation.registerValidationRules),
    userController.createUser
);

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Admin only
 */
router.get('/users', authenticate, authorize(['admin']), cacheMiddleware, userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get a single user by ID
 * @access Admin only
 */
router.get(
    '/user/:userId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['userId'], 'params'),
    cacheMiddleware,
    userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Update a user by ID
 * @access Admin only
 */
router.put(
    '/user/:userId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['userId'], 'params'),
    userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user by ID
 * @access Admin only
 */
router.delete(
    '/user/:userId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['userId'], 'params'),
    userController.deleteUser
);

module.exports = router;
