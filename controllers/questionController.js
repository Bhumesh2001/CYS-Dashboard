const Question = require('../models/Question');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

// **Add Question**
exports.addQuestion = async (req, res, next) => {
    try {
        const question = new Question(req.body);
        await question.save();
        flushCacheByKey('/api/questions');
        res.status(201).json({ success: true, message: 'Question added successfully', question });
    } catch (error) {
        next(error);
    };
};

// **Get All Questions**
exports.getAllQuestions = async (req, res, next) => {
    try {
        const questions = await Question.find({}, { createdAt: 0, updatedAt: 0 })
            .populate('categoryId', '-createdAt -updatedAt')
            .populate('chapterId', '-createdAt -updatedAt')
            .lean();
        res.status(200).json({
            success: true,
            message: 'Question fetched successsfully...!',
            totalQuestins: questions.length,
            data: questions,
        });
    } catch (error) {
        next(error);
    };
};

// **Get Single Question by ID**
exports.getQuestionById = async (req, res, next) => {
    try {
        const question = await Question.findById(
            req.params.questionId,
            { createdAt: 0, updatedAt: 0 })
            .populate('categoryId', '-createdAt -updatedAt')
            .lean();
        if (!question) {
            return res.status(404).json({ success: true, message: 'Question not found' });
        }
        res.status(200).json({ success: true, message: 'Question fetched successfully...!', question });
    } catch (error) {
        next(error);
    };
};

// **Update Question**
exports.updateQuestion = async (req, res, next) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.questionId,
            req.body,
            { new: true, runValidators: true }
        ).populate('quizId', 'title category');

        if (!updatedQuestion) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        };
        flushCacheByKey('/api/questions');
        flushCacheByKey(req.oiriginalUrl);

        res.status(200).json({ success: true, message: 'Question updated successfully', updatedQuestion });
    } catch (error) {
        next(error);
    };
};

// **Delete Question**
exports.deleteQuestion = async (req, res, next) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.questionId);

        if (!deletedQuestion) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        };
        flushCacheByKey('/api/questions');
        flushCacheByKey(req.oiriginalUrl);

        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        next(error);
    };
};
