const mongoose = require('mongoose');

/**
 * Subject Schema
 * 
 * Represents a subject in the database.
 */
const subjectSchema = new mongoose.Schema({
    /**
     * Class ID
     * 
     * The unique identifier for the class the subject belongs to.
     */
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',  // Assuming you have a 'Class' model
        required: [true, 'Class ID is required'],
    },
    /**
     * Subject Name
     * 
     * The name of the subject.
     */
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        minlength: [2, 'Subject name must be at least 2 characters long'],
        maxlength: [100, 'Subject name must be less than 100 characters'],
        trim: true,
    },
    /**
     * Subject Description
     * 
     * A brief description of the subject.
     */
    description: {
        type: String,
        maxlength: [500, 'Description must be less than 500 characters'],
        trim: true,
    },
    /**
    * Status of the subject.
    * Indicates if the subject is active or inactive.
    */
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
    versionKey: false,
});

/**
 * Compound Indexing
 * 
 * Creates indexes for faster queries on name, status, and classId.
 */
subjectSchema.index({ name: 1 }, { unique: true });
subjectSchema.index({ status: 1 });
subjectSchema.index({ classId: 1 });  // Added index on classId for optimized queries

/**
 * Subject Model
 * 
 * The mongoose model for the subject schema.
 */
module.exports = mongoose.model('Subject', subjectSchema);
