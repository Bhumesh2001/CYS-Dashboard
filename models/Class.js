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
    },
    /**
     * Status of the class.
     * Indicates if the class is active or archived.
     */
    status: {
        type: String,
        default: 'Active',
    },
}, {
    timestamps: true,
    collection: 'classes',
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
