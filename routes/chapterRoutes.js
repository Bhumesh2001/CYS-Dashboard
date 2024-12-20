const express = require('express');

// **Chapter Controller**
const chapterController = require('../controllers/chapterController');

// **Authentication and Validation**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const chapterValidation = require('../validation/validator');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');

// **app**
const router = express.Router();

// **Create Chapter**
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateFields(chapterValidation.chapterValidationRule),
    chapterController.createChapter
);

// **Get all Chapter**
router.get('/', authenticate, authorize(['admin']), chapterController.getAllChapter);

// Route to get chapters by subjectId
router.get(
    '/subject/:subjectId',
    authenticate,
    validateObjectIds(['subjectId'], 'params'),
    chapterController.getChaptersBySubjectId
);

// **Get Chapter by ID**
router.get(
    '/:chapterId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['chapterId'], 'params'),
    chapterController.getChapterById
);

// **Update Chapter by ID**
router.put(
    '/:chapterId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['chapterId'], 'params'),
    validateFields(chapterValidation.chapterValidationRule),
    chapterController.updateChapter
);

// **Delete Chapter by ID**
router.delete(
    '/:chapterId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['chapterId'], 'params'),
    chapterController.deleteChapter
);

module.exports = router;
