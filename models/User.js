const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// **User Schema**
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Full name is required'],
        minlength: [3, 'Full name must be at least 3 characters long'],
        maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures email is unique
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address',
        ],
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [
            /^\d{10}$/,
            'Mobile number must be a valid 10-digit number',
        ],
        unique: true, // Ensures mobile number is unique
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        maxlength: [100, 'Password cannot exceed 100 characters'],
        select: false, // Prevent password from being returned in queries
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function (value) {
                // `this.password` is the password field; it works during save only
                return value === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    className: {
        type: String,
        required: function () {
            return this.role === 'user';
        },
        validate: {
            validator: function (value) {
                return this.role !== 'user' || (value && value.trim().length > 0);
            },
            message: 'Class is required!',
        },
    },
    profileUrl: {
        type: String,
        trim: true,
        match: [
            /^(https?:\/\/)?([\w.-]+)\.[a-z]{2,}\/?.*$/,
            'Please enter a valid URL',
        ],
    },
    publicId: {
        type: String,
        unique: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
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
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

// **Indexes**
userSchema.index({ email: 1 }, { unique: true }); // Email indexing for uniqueness and faster lookups
userSchema.index({ role: 1 }); // Role-based querying
userSchema.index({ mobile: 1 }, { unique: true }); // Mobile number indexing for quick lookups
userSchema.index({ className: 1, status: 1 });

// **Pre-save middleware to hash password**
userSchema.pre('save', async function (next) {
    this.confirmPassword = undefined;
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12); // Increased salt rounds for better security
    }
    next();
});

// **Method to compare passwords**
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password || !candidatePassword) {
        throw new Error('Password comparison failed: missing password data');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// **User model**
module.exports = mongoose.model('User', userSchema);
