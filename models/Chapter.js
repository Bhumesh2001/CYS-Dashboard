const mongoose = require('mongoose');

// **Chapter Schema**
const chapterSchema = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject ID is required'],
    },
    name: {
        type: String,
        required: [true, 'Chapter name is required'],
        minlength: [2, 'Chapter name must be at least 2 characters long'],
        maxlength: [200, 'Chapter name must be less than 200 characters'],
        trim: true,
    },
    description: {
        type: String,
        maxlength: [500, 'Description must be less than 500 characters'],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        match: [
            /^(https?:\/\/)([\w.-]+)(:[0-9]{1,5})?(\/.*)?$/,
            'Invalid URL format for imageUrl',
        ],
        trim: true,
    },
    publicId: {
        type: String,
        required: [true, 'Public ID is required'],
        unique: true,
        trim: true,
    },
    pdfUrl: {
        type: {
            url: {
                type: String,
                trim: true,
            },
            publicId: {
                type: String,
                unique: true,
                trim: true,
                required: function () {
                    return this.pdfUrl?.url && this.pdfUrl?.url.length > 0;
                },
            },
        },
        default: {}, // Ensure default value is provided
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Indexing for faster queries
chapterSchema.index({ subjectId: 1 });
chapterSchema.index({ name: 1, status: 1 });
chapterSchema.index({ subjectId: 1, status: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
