const mongoose = require('mongoose');

// **Chapter Schema**
const chapterShcema = new mongoose.Schema({
    /**
     * Subject ID
     * 
     * The unique identifier for the subject the chapter belongs to.
     */
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',  // Assuming you have a 'Subject' model
        required: [true, 'Subject ID is required'],
    },
    /**
     * Name of the Chapter
     * 
     * The name of the chapter.
     */
    name: {
        type: String,
        required: [true, 'Chapter name is required'],
        minlength: [2, 'Chapter name must be at least 2 characters long'],
        maxlength: [200, 'Chapter name must be less than 200 characters'],
        trim: true,
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
     * Image URL for the Chapter.
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
    pdfUrl: {
        url: {
            type: String,
            validate: {
                validator: function (v) {
                    // Regex to validate any well-formed URL (http/https)
                    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,}(\/[^\s]*)?$/i;
                    return urlRegex.test(v);
                },
                message: props => `${props.value} is not a valid URL!`
            }
        },
        /**
         * public_id of the imageUrl
         * This is required only if a URL is provided
         */
        publicId: {
            type: String,
            unique: true, // Ensures no duplicate public_id
            trim: true, // Removes any leading/trailing spaces
            required: function () {
                // Only make publicId required if url is provided
                return this.url && this.url.length > 0;
            }
        }
    },
    /**
     * Status of the Chapter
     * 
     * Indicates whether the chapter is active or inactive.
     */
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    versionKey: false, // Disable __v field
});

/**
 * Indexing for faster query performance
 * 
 * Create indexes on subjectId, name, and status fields.
 */
chapterShcema.index({ subjectId: 1 });
chapterShcema.index({ name: 1, status: 1 });

/**
 * Chapter Model
 * 
 * The mongoose model for the chapter schema.
 */
module.exports = mongoose.model('Chapter', chapterShcema);
