const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// **Create Quiz**
exports.createQuiz = async (req, res, next) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
    } catch (error) {
        next(error);
    }
};

// **Get All Quizzes**
exports.getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({},
            { createdAt: 0, updatedAt: 0, classId: 0, subjectId: 0, chapterId: 0, categoryId: 0 }
        ).lean();
        res.status(200).json({
            success: true,
            message: 'Quizes fetched successfully...!',
            totaQuizess: quizzes.length,
            quizzes
        });
    } catch (error) {
        next(error);
    }
};

// **Get Quiz by ID**
exports.getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(
            req.params.quizId,
            { createdAt: 0, updatedAt: 0, classId: 0, subjectId: 0, chapterId: 0, categoryId: 0 }
        ).lean();

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.json({ success: true, message: 'Quiz fetched successfully...!', quiz });
    } catch (error) {
        next(error);
    }
};

// Get Quiz by Chapter ID
exports.getQuizByChapterId = async (req, res, next) => {
    try {
        // Find a single quiz by chapterId
        const quiz = await Quiz.findOne(
            { chapterId: req.params.chapterId },
            { createdAt: 0, updatedAt: 0, classId: 0, subjectId: 0, chapterId: 0 } // Exclude non-essential fields
        ).lean();

        // Return 404 if no quiz is found
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'No quiz found for this chapter',
            });
        }

        // Fetch questions for the quiz's categoryId
        if (quiz.categoryId) {
            const questions = await mongoose.model('Question').find(
                { categoryId: quiz.categoryId },
                {
                    createdAt: 0,
                    updatedAt: 0,
                    answer: 0,
                    categoryId: 0,
                    chapterId: 0,
                    questionType: 0,
                    status: 0,
                } // Exclude unwanted fields
            ).lean();

            quiz.questions = questions.length ? questions : []; // Add questions to the quiz object
        } else {
            quiz.questions = []; // Handle case where categoryId is not available
        }

        res.status(200).json({
            success: true,
            message: 'Quiz retrieved successfully',
            data: quiz, // Returning a single quiz object
        });
    } catch (error) {
        next(error);
    }
};

// **Update Quiz**
exports.updateQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.status(200).json({ success: false, message: 'Quiz updated successfully', quiz });
    } catch (error) {
        next(error);
    }
};

// **Delete Quiz**
exports.deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.status(200).json({ success: false, message: 'Quiz deleted successfully' });
    } catch (error) {
        next(error);
    }
};
