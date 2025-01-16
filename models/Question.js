const mongoose = require('mongoose');

// **Question Schema**
const questionSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
    },
    question: {
        type: String,
        index: true,
    },
    options: {
        type: Map,
        of: String,
    },
    answer: {
        type: String,
    },
    questionType: {
        type: String,
        default: 'Options',
    },
    status: {
        type: String,
        default: 'Active',
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// **Indexes for performance optimization**
questionSchema.index({ chapterId: 1, question: 1 }, { unique: true });
questionSchema.index({ chapterId: 1, status: 1 });

// **Question Model**
module.exports = mongoose.model('Question', questionSchema);
