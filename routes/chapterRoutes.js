const express = require('express');

// **Chapter Controller**
const chapterController = require('../controllers/chapterController');

// **Authentication and Validation**
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const chapterValidation = require('../validation/validator');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const { cacheMiddleware } = require("../middlewares/cacheMiddle");

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
router.get('/', authenticate, authorize(['admin']), cacheMiddleware, chapterController.getAllChapter);

// Route to get chapters by subjectId
router.get(
    '/subject/:subjectId',
    authenticate,
    validateObjectIds(['subjectId'], 'params'),
    cacheMiddleware,
    chapterController.getChaptersBySubjectId
);

// Route to get chapters by classId
router.get(
    '/class/:classId',
    validateObjectIds(['classId'], 'params'),
    cacheMiddleware,
    chapterController.getChaptersByClassId
);

// **Get Chapter by ID**
router.get(
    '/:chapterId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['chapterId'], 'params'),
    cacheMiddleware,
    chapterController.getChapterById
);

// **Update Chapter by ID**
router.put(
    '/:chapterId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['chapterId'], 'params'),
    validateFields(chapterValidation.editChapterValidationRule),
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
