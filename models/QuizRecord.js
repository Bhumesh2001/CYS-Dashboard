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
        ref: 'User', // Reference to the User model
        required: [true, 'User ID is required'],
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: '{VALUE} is not a valid user ID',
        },
    },

    /**
     * quizId: Unique identifier for the quiz.
     * References the Quiz model. This is required and should be a valid ObjectId.
     */
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz', // Reference to the Quiz model
        required: [true, 'Quiz ID is required'],
        validate: {
            validator: mongoose.Types.ObjectId.isValid,
            message: '{VALUE} is not a valid quiz ID',
        },
    },

    /**
     * score: The score achieved by the user in the quiz.
     * This is required and must be a positive number.
     */
    score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [0, 'Score cannot be negative'],
    },

    /**
     * attempts: The number of attempts the user has made for this quiz.
     * This must be an integer and should default to 1 for the first attempt.
     */
    attempts: {
        type: Number,
        required: [true, 'Attempts are required'],
        min: [1, 'Attempts cannot be less than 1'],
        default: 1,
    },

    /**
     * attemptedAt: The date and time when the quiz was attempted.
     * This field is required and will store the timestamp of when the attempt happened.
     */
    attemptedAt: {
        type: Date,
        required: [true, 'Attempt date is required'],
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
