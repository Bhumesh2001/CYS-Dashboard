const express = require('express');

// **Subject Controller**
const subjectController = require('../controllers/subjectController');

// **Validation and Authentication**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const subjectValidation = require('../validation/validator');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');

// **app**
const router = express.Router();

// **Create subject**
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateFields(subjectValidation.subjectValidationRule),
    subjectController.createSubject
);

// **Get all subjects**
router.get('/', authenticate, subjectController.getAllSubjects);

// Route to get subjects by classId
router.get(
    '/class/:classId',
    authenticate,
    validateObjectIds(['classId'], 'params'),
    subjectController.getSubjectByClassId
);

// **Get subject by id**
router.get(
    '/:subjectId/subject',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['subjectId'], 'params'),
    subjectController.getSubjectById
);

// **Update subject by ID**
router.put(
    '/:subjectId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['subjectId'], 'params'),
    validateFields(subjectValidation.subjectValidationRule),
    subjectController.updateSubject
);

// **Delete subject by ID**
router.delete(
    '/:subjectId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['subjectId'], 'params'),
    subjectController.deleteSubject
);

module.exports = router;
