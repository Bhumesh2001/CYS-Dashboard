const express = require('express');
const router = express.Router();

// **Notification Controller and Authentication, Authorication**
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/authMiddle');

// **Validation**
const { validateFields } = require('../middlewares/validateMiddle');
const notiicationValidator = require('../validation/validator')

/**
 * @route POST /all
 * @desc Send a notification to all
 * @access Admin
 */
router.post(
    '/all',
    authenticate,
    authorize(['admin']),
    // validateFields(notiicationValidator.notificationValidationRules),
    notificationController.sendNotificationToAll
);

/**
 * @route POST /one
 * @desc Send a notification to  specific users
 * @access Admin
 */
router.post(
    '/single',
    authenticate,
    authorize(['admin']),
    // validateFields(notiicationValidator.notificationValidationRules),
    notificationController.sendNotificationToUser
);

module.exports = router;
