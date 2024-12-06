const Quiz = require('../models/Quiz');

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
        const quizzes = await Quiz.find({}, { createdAt: 0, updatedAt: 0 }).lean();
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
        const quiz = await Quiz.findById(req.params.quizId, { createdAt: 0, updatedAt: 0 });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        res.json({ success: true, message: 'Quiz fetched successfully...!', quiz });
    } catch (error) {
        next(error);
    }
};

// Get Quizzes by Chapter ID
exports.getQuizzesByChapterId = async (req, res, next) => {
    try {
        // Find active quizzes by chapterId        
        const quizzes = await Quiz.find(
            { chapterId: req.params.chapterId },
            { createdAt: 0, updatedAt: 0, answer: 0 }
        );

        // Early return if no quizzes found
        if (!quizzes.length) return res.status(404).json({
            success: false,
            message: 'No quizzes found for this chapter'
        });

        // Return the found quizzes
        res.status(200).json({
            success: true,
            message: 'Quizzes retrieved successfully',
            totalQuizzess: quizzes.length,
            data: quizzes
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
            return res.status(404).json({ message: 'Quiz not found' });
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
