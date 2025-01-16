const Question = require('../models/Question');
const { flushAllCache } = require("../middlewares/cacheMiddle");

// create bulk question
exports.createBulkquestion = async (req, res, next) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Invalid input, expected an array of questions'
            });
        };

        // Insert multiple questions at once using Mongoose
        const insertedQuestions = await Question.insertMany(req.body);

        // Optionally, flush cache if needed
        flushAllCache();

        res.status(201).json({
            success: true,
            message: 'Questions added successfully',
            questions: insertedQuestions
        });
    } catch (error) {
        next(error);
    };
};

// **Add Question**
exports.addQuestion = async (req, res, next) => {
    try {
        const question = new Question(req.body);
        await question.save();
        flushAllCache();
        res.status(201).json({ success: true, message: 'Question added successfully', question });
    } catch (error) {
        next(error);
    };
};

// **Get All Questions**
exports.getAllQuestions = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated data
        const questions = await Question.find({}, { question: 1, status: 1 })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        // Get the total count of questions
        const totalQuestions = await Question.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Questions fetched successfully...!',
            totalQuestions,
            totalPages: Math.ceil(totalQuestions / pageSize),
            currentPage: pageNumber,
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
            .populate('chapterId', 'name')
            .lean();
        if (!question) {
            return res.status(404).json({ success: true, status: 404, message: 'Question not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Question fetched successfully...!',
            data: question
        });
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
        );

        if (!updatedQuestion) {
            return res.status(404).json({ success: false, status: 404, message: 'Question not found' });
        };

        flushAllCache();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });
    } catch (error) {
        next(error);
    };
};

// **Delete Question**
exports.deleteQuestion = async (req, res, next) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete({ _id: req.params.questionId });

        if (!deletedQuestion) {
            return res.status(404).json({ success: false, status: 404, message: 'Question not found' });
        }

        // Flush cache for the relevant keys
        flushAllCache();

        return res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        next(error);
    };
};
