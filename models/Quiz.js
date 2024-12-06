const mongoose = require('mongoose');

// **Quiz Schema**
const quizSchema = new mongoose.Schema({
    /**
     * Chapter ID (reference to Chapter model)
     * 
     * The unique identifier for the chapter the quiz belongs to.
     */
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',  // References the Chapter model
        required: [true, 'Chapter ID is required'],
    },
    /**
     * Question for the quiz
     * 
     * The question text for the quiz.
     */
    question: {
        type: String,
        required: [true, 'Question is required'],
        minlength: [5, 'Question must be at least 5 characters long'],
        maxlength: [1000, 'Question cannot exceed 1000 characters'],
        trim: true,
    },
    /**
     * Options for the quiz question
     * 
     * The multiple-choice options for the question.
     */
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function (v) {
                return v.length === 4; // Ensure exactly 4 options
            },
            message: 'There must be exactly 4 options.',
        },
    },
    /**
     * Correct answer for the quiz
     * 
     * The correct answer for the quiz question.
     */
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        validate: {
            validator: function (v) {
                return this.options.includes(v); // Ensure answer is one of the options
            },
            message: 'Answer must match one of the provided options.',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Removes the __v field
});

/**
 * Indexing for faster querying
 * 
 * Add compound index on `chapterId` and `question` for faster lookup and uniqueness.
 * Index on `answer` to optimize queries that filter by the correct answer.
 */
quizSchema.index({ chapterId: 1, question: 1 }, { unique: true }); // Ensures no duplicate questions in the same chapter
quizSchema.index({ chapterId: 1 }); // Index for fast lookup by chapter
quizSchema.index({ answer: 1 }); // Index for fast lookup by answer (if querying by answer frequently)

/**
 * Quiz Model
 * 
 * The mongoose model for the quiz schema.
 */
module.exports = mongoose.model('Quiz', quizSchema);
