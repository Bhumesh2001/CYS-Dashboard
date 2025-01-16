const express = require('express');

// **Class Controller**
const classController = require('../controllers/classController');

// **Validation and Authentication**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const classValidation = require('../validation/validator');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");

// **app**
const router = express.Router();

// **Create Class**
router.post(
    '/', authenticate,
    authorize(['admin']),
    validateFields(classValidation.classValidationRule),
    classController.createClass
);

// **Get all classes**
router.get('/', cacheMiddleware, classController.getAllClasses);

// **Get class by ID**
router.get(
    '/:classId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['classId'], 'params'),
    cacheMiddleware,
    classController.getClassById
);

// **Update class by ID**
router.put(
    '/:classId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['classId'], 'params'),
    validateFields(classValidation.editClassValidationRule),
    classController.updateClass
);

// **Delete class by ID**
router.delete(
    '/:classId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['classId'], 'params'),
    classController.deleteClass
);

module.exports = router;
