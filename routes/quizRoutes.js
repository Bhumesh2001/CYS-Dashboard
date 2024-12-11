const express = require('express');
const router = express.Router();

// **Controllers**
const quizController = require('../controllers/quizController');

// **Authentication and Validation**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const quizValidation = require('../validation/validator');

// **Create quiz**
router.post(
    '/quiz',
    authenticate,
    authorize(['admin']),
    validateFields(quizValidation.quizValidationRules),
    quizController.createQuiz
);

// **Get all quizes**
router.get('/', authenticate, authorize(['admin']), quizController.getQuizzes);

// POST: Submit a quiz and calculate the score
router.post(
    '/quiz/submit-quiz',
    authenticate,
    validateObjectIds(['quizId', 'userId']),
    quizController.submitQuiz
);

// **Get Quiz by ID**
router.get(
    '/quiz/:quizId',
    authenticate,
    validateObjectIds(['quizId'], 'params'),
    quizController.getQuizById
);

// Route to get quizzes by chapterId
router.get(
    '/chapter/:chapterId',
    authenticate,
    validateObjectIds(['chapterId'], 'params'),
    quizController.getQuizByChapterId
);

// **Update Quiz**
router.put(
    '/quiz/:quizId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['quizId'], 'params'),
    quizController.updateQuiz
);

// **Delete Quiz**
router.delete(
    '/quiz/:quizId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['quizId'], 'params'),
    quizController.deleteQuiz
);

module.exports = router;
