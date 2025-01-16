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
        ref: 'Class',
    },
    /**
     * Subject ID (reference to Subject model)
     * 
     * The unique identifier for the subject the quiz belongs to.
     */
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    },
    /**
     * Chapter ID (reference to Chapter model)
     * 
     * The unique identifier for the chapter the quiz belongs to.
     */
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
    },
    /**
     * Quiz Title
     * 
     * The title of the quiz.
     */
    quizTitle: {
        type: String,
    },
    /**
     * Quiz Time
     * 
     * The duration of the quiz in minutes.
     */
    quizTime: {
        type: Number,
    },
    /**
     * Description
     * 
     * A brief description of the quiz.
     */
    description: {
        type: String,
    },
    /**
     * Image URL
     * 
     * The URL of the image associated with the quiz.
     */
    imageUrl: {
        type: String,
    },
    /**
     * public_id of the imageUrl
     */
    publicId: {
        type: String,
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
