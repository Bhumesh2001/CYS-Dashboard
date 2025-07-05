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
        ref: 'Class',
    },
    /**
     * Subject Name
     * 
     * The name of the subject.
     */
    name: {
        type: String,
    },
    /**
    * Image URL for the category.
    * 
    * - Required: Yes
    * - Valid URL Format
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
    /**
    * Status of the subject.
    * Indicates if the subject is active or inactive.
    */
    status: {
        type: String,
        default: 'Active',
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
subjectSchema.index({ name: 1, classId: 1 }, { unique: true });
subjectSchema.index({ publicId: 1 }, { unique: true });

/**
 * Subject Model
 * 
 * The mongoose model for the subject schema.
 */
module.exports = mongoose.model('Subject', subjectSchema);
