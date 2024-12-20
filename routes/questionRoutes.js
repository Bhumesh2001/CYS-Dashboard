const express = require('express');
const router = express.Router();

// **Question Controller and Authentication, Authorization**
const questonController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const questionValidation = require('../validation/validator');
const { validateFields } = require('../middlewares/validateMiddle');

// Create a new Question
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateFields(questionValidation.questionValidationRule),
    questonController.addQuestion
);

// Get all categories
router.get('/', authenticate, authorize(['admin']), questonController.getAllQuestions);

// Get a Question by ID
router.get(
    '/:questionId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['questionId'], 'params'),
    questonController.getQuestionById
);

// Update a Question by ID
router.put(
    '/:questionId',
    authenticate,
    authorize(['admin']),
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
