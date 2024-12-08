const express = require('express');
const router = express.Router();

// **Category Controller and Authentication, Authorization**
const questonController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');

// Create a new category
router.post('/', authenticate, authorize(['admin']), questonController.addQuestion);

// Get all categories
router.get('/', authenticate, authorize(['admin']), questonController.getAllQuestions);

// Get a category by ID
router.get(
    '/:questionId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['questionId'], 'params'),
    questonController.getQuestionById
);

// Update a category by ID
router.put(
    '/:questionId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['questionId'], 'params'),
    questonController.updateQuestion
);

// Delete a category by ID
router.delete(
    '/:questionId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['questionId'], 'params'),
    questonController.deleteQuestion
);

module.exports = router;
