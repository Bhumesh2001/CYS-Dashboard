const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// **User Schema**
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true, // Allow users to not have a mobile number
    },
    password: {
        type: String,
        select: false,
    },
    confirmPassword: {
        type: String,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    },
    profileUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    otpVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: 'Active',
    },
}, {
    timestamps: true,
});

// **Indexes**
userSchema.index({ email: 1 }, { unique: true }); // Email indexing for uniqueness and faster lookups
userSchema.index({ role: 1 }); // Role-based querying
userSchema.index({ mobile: 1 }); // Mobile number indexing for quick lookups
userSchema.index({ classId: 1, status: 1 });

// **Pre-save middleware to hash password**
userSchema.pre('save', async function (next) {
    this.confirmPassword = undefined;
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    };
    next();
});

// **Method to compare passwords**
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password || !candidatePassword) {
        throw new Error('Password comparison failed: missing password data');
    };
    return await bcrypt.compare(candidatePassword, this.password);
};

// **User model**
module.exports = mongoose.model('User', userSchema);
