const mongoose = require('mongoose');

/**
 * Category Schema
 * 
 * Represents a category with a name and an associated image URL.
 */
const categorySchema = new mongoose.Schema({
    /**
     * Name of the category.
     * 
     * - Required: Yes
     * - Min Length: 2
     * - Max Length: 50
     */
    name: {
        type: String,
        required: [true, 'Category name is required'],
        minlength: [2, 'Category name must be at least 2 characters long'],
        maxlength: [50, 'Category name must be less than 50 characters long'],
        unique: true, // Ensure unique category names
        trim: true, // Remove extra whitespace
    },
    /**
     * Brief description of the Chapter
     * 
     * A short description of the chapter's content.
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
   * Status of the cateory.
   * Indicates if the cateory is active or archived.
   */
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true, // Add createdAt and updatedAt timestamps
    versionKey: false, // Disable the version key (__v)
});

/**
 * Indexing
 * 
 * - Create a unique index on the name field for optimized queries.
 */
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ status: 1 });

// **Category model**
module.exports = mongoose.model('Category', categorySchema);
