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
    * Image URL for the category.
    * 
    * - Required: Yes
    * - Valid URL Format
    */
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        match: [
            /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[\w.,@?^=%&:;#/~+-]*$/,
            'Please provide a valid URL',
        ],
        trim: true,
    },
    /**
     * public_id of the imageUrl
     */
    publicId: {
        type: String,
        required: [true, 'Public ID is required'], // Field is mandatory
        unique: true, // Ensures no duplicate public_id
        trim: true, // Removes any leading/trailing spaces
    },
    /**
    * Status of the subject.
    * Indicates if the subject is active or inactive.
    */
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
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
