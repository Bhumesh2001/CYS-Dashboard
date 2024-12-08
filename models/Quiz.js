const mongoose = require('mongoose');

// **Quiz Schema**
const quizSchema = new mongoose.Schema({
    /**
     * Class ID (reference to Class model)
     * 
     * The unique identifier for the class the quiz belongs to.
     */
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', // References the Class model
        required: [true, 'Class ID is required'],
        validate: {
            validator: (v) => mongoose.Types.ObjectId.isValid(v),
            message: '{VALUE} is not a valid class ID',
        },
    },
    /**
     * Subject ID (reference to Subject model)
     * 
     * The unique identifier for the subject the quiz belongs to.
     */
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject', // References the Subject model
        required: [true, 'Subject ID is required'],
        validate: {
            validator: (v) => mongoose.Types.ObjectId.isValid(v),
            message: '{VALUE} is not a valid subject ID',
        },
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
     * Category ID (reference to Category model)
     * 
     * The unique identifier for the category the quiz belongs to.
     */
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // References the Category model
        required: [true, 'Category ID is required'],
        validate: {
            validator: (v) => mongoose.Types.ObjectId.isValid(v),
            message: '{VALUE} is not a valid category ID',
        },
    },
    /**
     * Quiz Title
     * 
     * The title of the quiz.
     */
    quizTitle: {
        type: String,
        required: [true, 'Quiz title is required'],
        minlength: [5, 'Quiz title must be at least 5 characters long'],
        maxlength: [200, 'Quiz title cannot exceed 200 characters'],
        trim: true,
        lowercase: true,
    },
    /**
     * Quiz Time
     * 
     * The duration of the quiz in minutes.
     */
    quizTime: {
        type: Number,
        required: [true, 'Quiz time is required'],
        min: [1, 'Quiz time must be at least 1 minute'],
        max: [360, 'Quiz time cannot exceed 360 minutes'],
    },
    /**
     * Image URL
     * 
     * The URL of the image associated with the quiz.
     */
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true,
        validate: {
            validator: (v) => /^https?:\/\/[^\s]+$/i.test(v),
            message: '{VALUE} is not a valid image URL',
        },
    },
    /**
     * Description
     * 
     * A brief description of the quiz.
     */
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        trim: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Removes the __v field
});

/**
 * Indexing for faster querying
 * 
 * Add compound index on relevant fields for faster lookup and uniqueness.
 */
quizSchema.index({ classId: 1, subjectId: 1, chapterId: 1, quizTitle: 1 }, { unique: true });
quizSchema.index({ chapterId: 1 }); // Index for fast lookup by chapter
quizSchema.index({ categoryId: 1 }); // Index for fast lookup by category
quizSchema.index({ quizTitle: 1 }); // Index for fast lookup by title

/**
 * Quiz Model
 * 
 * The mongoose model for the quiz schema.
 */
module.exports = mongoose.model('Quiz', quizSchema);
