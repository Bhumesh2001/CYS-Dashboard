const mongoose = require('mongoose');

// **Question Schema**
const questionSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: [true, 'Chapter ID is required'],
        validate: {
            validator: (v) => mongoose.Types.ObjectId.isValid(v),
            message: '{VALUE} is not a valid chapter ID',
        },
    },
    question: {
        type: String,
        required: [true, 'Question is required'],
        minlength: [5, 'Question must be at least 5 characters long'],
        maxlength: [1000, 'Question cannot exceed 1000 characters'],
        trim: true,
        index: true,
    },
    options: {
        type: Map,
        of: String,
        required: [true, 'Options are required'],
        validate: {
            validator: function (v) {
                if (!(v instanceof Map)) {
                    return false;
                }
                return v.size === 4 && ['a', 'b', 'c', 'd'].every(key => v.has(key));
            },
            message: 'Options must have exactly 4 keys: a, b, c, and d.',
        },
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        enum: ['a', 'b', 'c', 'd'],
    },
    questionType: {
        type: String,
        enum: ['Guess Word', 'True/False', 'Short Answer', 'Options'],
        default: 'Options',
        required: [true, 'Question type is required'],
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
        required: [true, 'Status is required'],
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
