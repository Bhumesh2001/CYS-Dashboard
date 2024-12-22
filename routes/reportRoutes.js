const express = require('express');
const router = express.Router();

// **Report controller and Authentication, Authorization**
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddle');

// **Validation**
const { validateFields } = require('../middlewares/validateMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");
const reportValidation = require('../validation/validator');

// Create a new report
router.post(
    '/',
    authenticate,
    validateFields(reportValidation.reportValidationRule),
    reportController.createReport
);

// Get all reports
router.get('/', authenticate, authorize(['admin']), cacheMiddleware, reportController.getAllReports);

// Get a report by ID
router.get(
    '/:reportId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['reportId'], 'params'),
    cacheMiddleware,
    reportController.getReportById
);

// Update report status
router.patch(
    '/:reportId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['reportId'], 'params'),
    reportController.updateReportStatus
);

// Delete a report by ID
router.delete(
    '/:reportId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['reportId'], 'params'),
    reportController.deleteReport
);

module.exports = router;
