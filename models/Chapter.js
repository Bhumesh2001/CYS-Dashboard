const mongoose = require('mongoose');

// **Chapter Schema**
const chapterSchema = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
    pdfUrl: {
        type: {
            url: {
                type: String,
            },
            publicId: {
                type: String,
            },
        },
        default: {},
    },
    status: {
        type: String,
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
