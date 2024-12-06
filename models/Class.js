const mongoose = require('mongoose');

/**
 * Class Schema
 * 
 * Represents a class in the database.
 */
const classSchema = new mongoose.Schema({
    /**
     * Class name.
     * 
     * @type {String}
     * @required
     * @minlength 2
     * @maxlength 50
     * @unique
     */
    name: {
        type: String,
        required: [true, 'Class name is required'],
        minlength: [2, 'Class name must be at least 2 characters long'],
        maxlength: [50, 'Class name must be less than 50 characters'],
        trim: true,
        unique: true,
    },
    /**
     * Class description.
     * 
     * @type {String}
     * @maxlength 500
     */
    description: {
        type: String,
        maxlength: [500, 'Description must be less than 500 characters'],
        trim: true,
    },
    /**
     * Status of the class.
     * Indicates if the class is active or archived.
     */
    status: {
        type: String,
        enum: ['active', 'Inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
    collection: 'classes', // specify the collection name
});

// Indexing for faster lookups
classSchema.index({ name: 1 }, { unique: true });
classSchema.index({ status: 1 });

/**
 * Class Model
 * 
 * Represents a class in the database.
 */
module.exports = mongoose.model('Class', classSchema);