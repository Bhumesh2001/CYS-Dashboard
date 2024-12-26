const mongoose = require('mongoose');

// **SMTP Settings Schema**
const smtpSettingsSchema = new mongoose.Schema({
    smtpType: {
        type: String,
        required: [true, 'SMTP Type is required'],
        enum: ['Gmail', 'Outlook', 'Custom'], // Restrict to predefined types
        default: 'Custom'
    },
    smtpHost: {
        type: String,
        required: [true, 'SMTP Host is required'],
        trim: true,
        maxlength: [255, 'SMTP Host must be less than 255 characters']
    },
    smtpEmail: {
        type: String,
        required: [true, 'SMTP Email is required'],
        validate: {
            validator: function (v) {
                return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Email format validation
            },
            message: 'Invalid SMTP Email format'
        },
        unique: true
    },
    smtpPassword: {
        type: String,
        required: [true, 'SMTP Password is required'],
        minlength: [8, 'SMTP Password must be at least 8 characters long']
    },
    smtpSecure: {
        type: Boolean,
        required: [true, 'SMTP Secure is required'],
        default: false
    },
    smtpPort: {
        type: Number,
        required: [true, 'SMTP Port is required'],
        validate: {
            validator: function (v) {
                return v > 0 && v <= 65535; // Valid port range
            },
            message: 'SMTP Port must be a number between 1 and 65535'
        }
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'smtpSettings', // Explicit collection name
    versionKey: false // Remove version key
});

smtpSettingsSchema.pre('save', function (next) {
    if (this.smtpType === 'Gmail') {
        this.smtpHost = 'smtp.gmail.com';
        this.smtpPort = 587;
        this.smtpSecure = true;
    } else if (this.smtpType === 'Outlook') {
        this.smtpHost = 'smtp.office365.com';
        this.smtpPort = 587;
        this.smtpSecure = true;
    }
    next();
});

// **General Settings Schema**
const generalSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: [true, 'Site Name is required'],
        trim: true,
        minlength: [3, 'Site Name must be at least 3 characters long'],
        maxlength: [100, 'Site Name must be less than 100 characters'],
        index: true // Adding an index for faster searches if needed
    },
    siteLogo: {
        type: String,
        required: [true, 'Site Logo is required'],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v); // Validates URL format
            },
            message: 'Site Logo must be a valid URL'
        }
    },
    publicId: {
        type: String,
        required: [true, 'Public ID is required'], // Field is mandatory
        unique: true, // Ensures no duplicate public_id
        trim: true, // Removes any leading/trailing spaces
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'generalSettings', // Explicit collection name
    versionKey: false // Remove version key
});

// Models
const GeneralSettings = mongoose.model('GeneralSettings', generalSettingsSchema);
const SmtpSettings = mongoose.model('SmtpSettings', smtpSettingsSchema);

module.exports = {
    GeneralSettings,
    SmtpSettings
};