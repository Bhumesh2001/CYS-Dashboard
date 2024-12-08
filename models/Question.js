const mongoose = require('mongoose');

// **Question Schema**
const questionSchema = new mongoose.Schema({
    /**
    * Category ID (reference to Category model)
    * 
    * The unique identifier for the category the quiz belongs to.
    */
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // References the Category model
        required: [true, 'Category ID is required'],
        index: true,
    },
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
     * The multiple-choice options for the question.
     */
    options: {
        type: [{ type: String, trim: true }],
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
questionSchema.index({ categoryId: 1, question: 1 }, { unique: true });
questionSchema.index({ status: 1 });

// **Question Model**
module.exports = mongoose.model('Question', questionSchema);