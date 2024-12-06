const mongoose = require('mongoose');

/**
 * Report Schema
 * 
 * Represents a report submitted by a user.
 */
const reportSchema = new mongoose.Schema({
    /**
     * The ID of the reported entity (e.g., Question, User).
     * 
     * - Required: Yes
     * - Type: ObjectId
     */
    reportedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Reported ID is required'],
        refPath: 'reportedModel', // Dynamically references the model type
    },

    /**
     * The model of the reported entity (e.g., Question, User).
     * 
     * - Required: Yes
     * - Enum: Limits to specific models for consistency
     */
    reportedModel: {
        type: String,
        required: [true, 'Reported model is required'],
        enum: ['Question', 'User', 'Category'], // Add other models if needed
    },

    /**
     * The ID of the user who submitted the report.
     * 
     * - Required: Yes
     * - Type: ObjectId
     */
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Reporter ID is required'],
        ref: 'User',
    },

    /**
     * Reason for the report.
     * 
     * - Required: Yes
     * - Min Length: 10
     * - Max Length: 300
     */
    reason: {
        type: String,
        required: [true, 'Report reason is required'],
        minlength: [10, 'Reason must be at least 10 characters long'],
        maxlength: [300, 'Reason must be less than 300 characters long'],
        trim: true,
    },

    /**
     * Status of the report.
     * 
     * - Default: 'pending'
     * - Enum: Allowed values are 'pending', 'resolved', 'rejected'
     */
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true, // Add createdAt and updatedAt timestamps
    versionKey: false, // Disable the version key (__v)
});

/**
 * Indexing
 * 
 * - Optimized queries by indexing reporterId and reportedId.
 */
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedId: 1, reportedModel: 1 });

// **Report model**
module.exports = mongoose.model('Report', reportSchema);
