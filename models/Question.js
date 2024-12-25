const mongoose = require('mongoose');

// **Question Schema**
const questionSchema = new mongoose.Schema({
    /**
     * Chapter ID (reference to Chapter model)
     * 
     * The unique identifier for the chapter the quiz belongs to.
     */
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter', // References the Chapter model
        required: [true, 'Chapter ID is required'],
        validate: {
            validator: (v) => mongoose.Types.ObjectId.isValid(v),
            message: '{VALUE} is not a valid chapter ID',
        },
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
        index: true,
    },
    /**
     * Options for the quiz question
     * 
     * The multiple-choice options for the question, stored as key-value pairs.
     */
    options: {
        type: Map, // Using Map to store key-value pairs
        of: String,
        required: [true, 'Options are required'],
        validate: {
            validator: function (v) {
                return v.size === 4 && ['a', 'b', 'c', 'd'].every(key => v.has(key));
            },
            message: 'Options must have exactly 4 keys: a, b, c, and d.',
        },
    },
    /**
     * Correct answer for the quiz
     * 
     * The key of the correct answer (e.g., 'a', 'b', 'c', or 'd').
     */
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        enum: ['a', 'b', 'c', 'd'], // Answer must be one of the keys
        validate: {
            validator: function (v) {
                return this.options && this.options.has(v); // Ensure answer key exists in options
            },
            message: 'Answer must match one of the option keys (a, b, c, d).',
        },
    },
    /**
    * Type of the question.
    * Specifies the type of question (e.g., multiple-choice, true/false, short-answer).
    */
    questionType: {
        type: String,
        enum: ['Guess Word', 'True/False', 'Short Answer', "Options"],
        default: 'Options',
        required: [true, 'Question type is required'],
    },
    /**
    * Status of the question.
    * Indicates if the question is active or inactive.
    */
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// **Indexes for performance optimization**
questionSchema.index({ question: 1 }, { unique: true });
questionSchema.index({ status: 1 });

// **Question Model**
module.exports = mongoose.model('Question', questionSchema);
