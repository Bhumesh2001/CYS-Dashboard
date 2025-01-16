const mongoose = require('mongoose');

// **SMTP Settings Schema**
const smtpSettingsSchema = new mongoose.Schema({
    smtpType: {
        type: String,
        default: 'Custom'
    },
    smtpHost: {
        type: String,
    },
    smtpEmail: {
        type: String,
    },
    smtpPassword: {
        type: String,
    },
    smtpSecure: {
        type: String,
    },
    smtpPort: {
        type: Number,
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
        this.smtpSecure = 'TLS';
    } else if (this.smtpType === 'Outlook') {
        this.smtpHost = 'smtp.office365.com';
        this.smtpPort = 587;
        this.smtpSecure = 'SSL';
    }
    next();
});

// **General Settings Schema**
const generalSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        index: true // Adding an index for faster searches if needed
    },
    siteLogo: {
        type: String,
    },
    publicId: {
        type: String,
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