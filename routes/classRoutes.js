const express = require('express');

// **Class Controller**
const classController = require('../controllers/classController');

// **Validation and Authentication**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');

// **app**
const router = express.Router();

// **Create Class**
router.post('/', authenticate, authorize(['admin']), classController.createClass);

// **Get all classes**
router.get('/', authenticate, classController.getAllClasses);

// **Get class by ID**
router.get(
    '/:classId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['classId'], 'params'),
    classController.getClassById
);

// Route to get subjects and chapters by class name
router.get('/subj-&-chap/:className', authenticate, classController.getSubjectAndChapterByClassName);

// **Update class by ID**
router.put(
    '/:classId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['classId'], 'params'),
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
