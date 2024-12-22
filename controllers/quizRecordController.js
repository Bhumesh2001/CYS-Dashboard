const QuizRecord = require('../models/QuizRecord');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

/**
 * Controller for getting all quiz records of a particular user
 */
exports.getUserQuizRecords = async (req, res, next) => {
    try {
        // Find quiz records by userId and exclude unnecessary fields early on
        const quizRecords = await QuizRecord.find(
            { userId: req.params.userId },
            { createdAt: 0, updatedAt: 0 } // Exclude fields from QuizRecord
        )
        .sort({ attemptedAt: -1 }) // Sort by attemptedAt descending
        .select('-createdAt -updatedAt') // Exclude unnecessary fields from the QuizRecord
        .populate({
            path: 'quizId',
            select: '-createdAt -updatedAt -classId -subjectId -chapterId', // Limit fields from Quiz model
        })
        .populate({
            path: 'userId',
            select: 'fullName email mobile profileUrl classId', // Limit fields from User model
        })
        .lean(); // Convert to plain JavaScript objects for better performance

        // Return a message if no records are found
        if (quizRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No quiz records found for this user' });
        };

        // Return success with quiz records
        res.status(200).json({
            success: true,
            message: 'Quiz records retrieved successfully',
            data: quizRecords
        });
    } catch (error) {
        next(error);
    };
};

/**
 * Controller for getting the score of a specific quiz attempt by userId and quizId
 */
exports.getQuizRecordByUserAndQuiz = async (req, res, next) => {
    try {
        // Find the quiz record by userId and quizId
        const quizRecord = await QuizRecord.findOne({
            userId: req.params.userId,
            quizId: req.params.quizId
        }, { createdAt: 0, updatedAt: 0 })
        .sort({ attemptedAt: -1 }) // Sort by attemptedAt descending
        .select('-createdAt -updatedAt') // Exclude unnecessary fields from the QuizRecord
        .populate({
            path: 'quizId',
            select: '-createdAt -updatedAt -classId -subjectId -chapterId', // Limit fields from Quiz model
        })
        .populate({
            path: 'userId',
            select: 'fullName email mobile profileUrl classId', // Limit fields from User model
        })
        .lean();

        if (!quizRecord) {
            return res.status(404).json({
                success: false,
                message: 'Quiz record not found for the given user and quiz'
            });
        };

        res.status(200).json({
            success: true,
            message: 'Quiz record retrieved successfully',
            data: quizRecord
        });
    } catch (error) {
        next(error);
    };
};

/**
 * Controller for updating a quiz record score (if needed)
 */
exports.updateQuizRecord = async (req, res, next) => {
    try {
        // Find and update quiz record
        const updatedRecord = await QuizRecord.findOneAndUpdate(
            { userId: req.params.userId, quizId: req.params.quizId },
            req.body,
            { new: true } // Return the updated document
        );

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Quiz record not found for the given user and quiz'
            });
        };

        flushCacheByKey(req.originalUrl);

        res.status(200).json({
            success: true,
            message: 'Quiz record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};
