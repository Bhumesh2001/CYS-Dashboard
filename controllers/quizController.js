const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizRecord = require('../models/QuizRecord');
const { ObjectId } = mongoose.Types;
const { uploadImage, deleteImage } = require('../utils/image');
const { flushAllCache } = require("../middlewares/cacheMiddle");

// **Create Quiz**
exports.createQuiz = async (req, res, next) => {
    try {
        // Initialize image data as null
        let imageData = { url: null, publicId: null };

        // Upload image if provided
        if (req.files?.imageUrl) {
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysQuizzesImg', 220, 200);
        }

        // Create quiz document
        const quiz = new Quiz({
            ...req.body,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
        });

        // Save quiz & clear cache
        await quiz.save();
        flushAllCache();

        res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
    } catch (error) {
        next(error);
    }
};

// **Get All Quizzes**
exports.getQuizzes = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated quizzes
        const quizzes = await Quiz.find(
            {},
            { quizTitle: 1, imageUrl: 1 }
        )
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .skip((pageNumber - 1) * pageSize) // Skip for pagination
            .limit(pageSize) // Limit the number of results
            .lean();

        // Get the total count of quizzes
        const totalQuizzes = await Quiz.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Quizzes fetched successfully...!',
            totalQuizzes,
            totalPages: Math.ceil(totalQuizzes / pageSize),
            currentPage: pageNumber,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    };
};

// **submit quiz**
exports.submitQuiz = async (req, res, next) => {
    const { userId, quizId, userAnswers } = req.body;

    try {
        // Convert quizId to ObjectId if needed
        const quizObjectId = ObjectId.isValid(quizId) ? new ObjectId(quizId) : null;
        if (!quizObjectId) {
            return res.status(422).json({ success: false, status: 422, message: 'Invalid quizId format.' });
        };

        // Fetch quiz and related questions using aggregation
        const quizData = await Quiz.aggregate([
            { $match: { _id: quizObjectId } }, // Match by ObjectId
            {
                $lookup: {
                    from: 'questions',
                    localField: 'chapterId',
                    foreignField: 'chapterId',
                    as: 'questions',
                },
            },
        ]);

        // Check if quiz exists
        if (!quizData.length) {
            return res.status(404).json({ success: false, status: 404, message: 'Quiz not found.' });
        };

        const quiz = quizData[0];
        const { questions } = quiz;

        if (!questions.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No questions found for this chapterId.'
            });
        };

        // Calculate the score and create the results list
        let correctCount = 0;
        let incorrectCount = 0;
        const results = questions.map((question, index) => {
            const isCorrect = userAnswers[index] === question.answer;
            if (isCorrect) correctCount++;
            else incorrectCount++;

            return {
                question: question.question,  // Assuming the question text is stored as 'questionText'
                options: question.options,        // List of options
                userAnswer: userAnswers[index],   // User's answer
                correctAnswer: question.answer,   // Correct answer
                isCorrect                          // Whether the answer is correct
            };
        });

        // Update or create quiz record in one query
        await QuizRecord.findOneAndUpdate(
            { userId, quizId },
            {
                $set: { score: correctCount, attemptedAt: new Date() },
                $inc: { attempts: 1 },
            },
            { upsert: true, new: true }
        );

        flushAllCache();

        // Return response with correct and incorrect count, and the question-by-question results
        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully!',
            score: correctCount,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            results // List of question, options, user answer, correct answer, and correctness status
        });
    } catch (error) {
        next(error);
    };
};

// **Get Quiz by ID**
exports.getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(
            req.params.quizId,
            { createdAt: 0, updatedAt: 0, publicId: 0 }
        )
            .populate('classId', 'name')
            .populate('subjectId', 'name')
            .populate('chapterId', 'name')
            .lean();

        if (!quiz) {
            return res.status(404).json({ success: false, status: 404, message: 'Quiz not found' });
        };

        res.json({ success: true, message: 'Quiz fetched successfully...!', data: quiz });
    } catch (error) {
        next(error);
    };
};

// Get Quiz by Chapter ID
exports.getQuizByChapterId = async (req, res, next) => {
    try {
        // Find a single quiz by chapterId
        const quiz = await Quiz.findOne(
            { chapterId: req.params.chapterId },
            { createdAt: 0, updatedAt: 0, classId: 0, subjectId: 0, publicId: 0 }
        ).lean();

        // Return 404 if no quiz is found
        if (!quiz) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No quiz found for this chapter',
            });
        };

        // Fetch questions for the quiz's chapterId
        if (quiz.chapterId) {
            const questions = await mongoose.model('Question').find(
                { chapterId: quiz.chapterId },
                {
                    createdAt: 0,
                    updatedAt: 0,
                    chapterId: 0,
                    questionType: 0,
                    status: 0,
                } // Exclude unwanted fields
            ).lean();

            quiz.totalQuestions = questions.length ? questions.length : 0;
            quiz.questions = questions.length ? questions : []; // Add questions to the quiz object
        } else {
            quiz.totalQuestions = 0;
            quiz.questions = []; // Handle case where chapterId is not available
        };

        res.status(200).json({
            success: true,
            message: 'Quiz retrieved successfully',
            data: quiz, // Returning a single quiz object
        });
    } catch (error) {
        next(error);
    };
};

// **Update Quiz**
exports.updateQuiz = async (req, res, next) => {
    try {
        // Fetch existing quiz data
        const existingQuiz = await Quiz.findById(req.params.quizId);
        if (!existingQuiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Initialize image data with existing values
        let imageData = { url: existingQuiz.imageUrl, publicId: existingQuiz.publicId };

        // If a new image is uploaded, replace the old one
        if (req.files?.imageUrl) {
            if (existingQuiz.publicId) {
                await deleteImage(existingQuiz.publicId); // Delete old image
            }
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysQuizzesImg', 220, 200);
        }

        // Update quiz with new or existing data
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            {
                ...req.body,
                imageUrl: imageData.url || null,
                publicId: imageData.publicId || null
            },
            { new: true, runValidators: true }
        );

        flushAllCache();

        res.status(200).json({ success: true, message: 'Quiz updated successfully', data: updatedQuiz });
    } catch (error) {
        next(error);
    }
};

// **Delete Quiz**
exports.deleteQuiz = async (req, res, next) => {
    try {
        const quizData = await Quiz.findById(req.params.quizId, { publicId: 1 }).lean();
        if (quizData && quizData.publicId) await deleteImage(quizData.publicId);

        const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, status: 404, message: 'Quiz not found' });
        };

        flushAllCache();

        res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
        next(error);
    };
};
