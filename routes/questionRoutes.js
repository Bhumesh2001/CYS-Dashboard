const express = require('express');
const router = express.Router();

// **Question Controller and Authentication, Authorization**
const questonController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const questionValidation = require('../validation/validator');
const { validateFields } = require('../middlewares/validateMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");

// create bulk question
router.post('/bulk', authenticate, authorize(['admin']), questonController.createBulkquestion);

// Create a new Question
router.post(
    '/',
    authenticate,
    authorize(['admin', 'teacher']),
    validateFields(questionValidation.questionValidationRule),
    questonController.addQuestion
);

// Get all questions
router.get(
    '/',
    authenticate,
    authorize(['admin', 'teacher']),
    cacheMiddleware,
    questonController.getAllQuestions
);

// Get a Question by ID
router.get(
    '/:questionId',
    authenticate,
    authorize(['admin', 'teacher']),
    validateObjectIds(['questionId'], 'params'),
    cacheMiddleware,
    questonController.getQuestionById
);

// Get question by class ID
router.get(
    '/class/:classId',
    authenticate,
    validateObjectIds(['classId'], 'params'),
    cacheMiddleware,
    questonController.getQuestionByClassId
);

// Update a Question by ID
router.put(
    '/:questionId',
    authenticate,
    authorize(['admin', 'teacher']),
    validateObjectIds(['questionId'], 'params'),
    validateFields(questionValidation.questionValidationRule),
    questonController.updateQuestion
);

// Delete a Question by ID
router.delete(
    '/:questionId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['questionId'], 'params'),
    questonController.deleteQuestion
);

module.exports = router;
