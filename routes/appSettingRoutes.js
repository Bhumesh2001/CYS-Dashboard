const express = require('express');
const router = express.Router();

// controller
const appSettingController = require('../controllers/appSettingController');

// **Authentication and Validation**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const appSettingValidation = require('../validation/validator');

// General
router
    .route('/general')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validateAppGeneralSettingsRule),
        appSettingController.createOrUpdateGeneral
    )
    .get(authenticate, authorize(['admin']), appSettingController.getGeneral);

// App Settings
router
    .route('/app')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validateAppSettingRule),
        appSettingController.createOrUpdateAppSetting
    )
    .get(authenticate, authorize(['admin']), appSettingController.getAppSetting);

// Privacy Policy
router
    .route('/privacy-policy')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validatePrivacyPolicyRule),
        appSettingController.createOrUpdatePrivacyPolicy
    )
    .get(authenticate, authorize(['admin']), appSettingController.getPrivacyPolicy);

// Terms and Conditions
router
    .route('/terms')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validateTermsRule),
        appSettingController.createOrUpdateTerms
    )
    .get(authenticate, authorize(['admin']), appSettingController.getTerms);

// Notification
router
    .route('/notification')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validateNotificationRule),
        appSettingController.createOrUpdateNotification
    )
    .get(authenticate, authorize(['admin']), appSettingController.getNotification);

// App Update
router
    .route('/app-update')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(appSettingValidation.validateAppUpdateRule),
        appSettingController.createOrUpdateAppUpdate
    )
    .get(authenticate, authorize(['admin']), appSettingController.getAppUpdate);

module.exports = router;
