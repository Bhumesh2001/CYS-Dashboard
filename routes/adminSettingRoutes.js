const express = require('express');
const router = express.Router();

// controllers
const adminSettingController = require('../controllers/adminSettingController');

// **Authentication and Validation**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const adminSettingValidation = require('../validation/validator');

// **General Settings Routes**

// Get General Create or Update General Settings 
router.route('/general')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(adminSettingValidation.validateGeneralSettingsRule),
        adminSettingController.createOrUpdateGeneralSettings
    )
    .get(authenticate, authorize(['admin']), adminSettingController.getGeneralSettings)

// **SMTP Settings Routes**

// Create or Update SMTP or Get SMTP Settings
router.route('/smtp')
    .post(
        authenticate,
        authorize(['admin']),
        validateFields(adminSettingValidation.validateSmtpSettingsRule),
        adminSettingController.createOrUpdateSmtpSettings
    )
    .get(authenticate, authorize(['admin']), adminSettingController.getSmtpSettings)

module.exports = router;
