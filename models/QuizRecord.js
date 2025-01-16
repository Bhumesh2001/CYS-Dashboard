const mongoose = require('mongoose');

/**
 * QuizRecord Schema
 * This schema stores the records of each user's attempt at a quiz, 
 * including the score, number of attempts, and the date of attempt.
 */
const quizRecordSchema = new mongoose.Schema({
    /**
     * userId: Unique identifier for the user.
     * References the User model. This is required and should be a valid ObjectId.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    /**
     * quizId: Unique identifier for the quiz.
     * References the Quiz model. This is required and should be a valid ObjectId.
     */
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
    },

    /**
     * score: The score achieved by the user in the quiz.
     * This is required and must be a positive number.
     */
    score: {
        type: Number,
    },

    /**
     * attempts: The number of attempts the user has made for this quiz.
     * This must be an integer and should default to 1 for the first attempt.
     */
    attempts: {
        type: Number,
        default: 1,
    },

    /**
     * attemptedAt: The date and time when the quiz was attempted.
     * This field is required and will store the timestamp of when the attempt happened.
     */
    attemptedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Removes the __v field
});

/**
 * Indexing for faster querying
 * - Composite index on userId and quizId for quick lookup by user and quiz.
 * - Index on attemptedAt to easily sort quiz attempts by date.
 */
quizRecordSchema.index({ userId: 1, quizId: 1 }); // Index on userId and quizId (to quickly retrieve records for a user-quiz pair)
quizRecordSchema.index({ attemptedAt: -1 }); // Index on attemptedAt to retrieve latest quiz attempts

/**
 * QuizRecord Model
 * The mongoose model for the quiz record schema.
 */
module.exports = mongoose.model('QuizRecord', quizRecordSchema);
