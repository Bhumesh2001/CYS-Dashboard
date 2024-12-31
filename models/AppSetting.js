const mongoose = require('mongoose');

// Define schema for general settings
const GeneralSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Invalid email format',
        },
        index: true,
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        minlength: [3, 'Author name must be at least 3 characters'],
        trim: true,
    },
    contact: {
        type: String,
        required: [true, 'Contact is required'],
        validate: {
            validator: (v) => /^[0-9]{10}$/.test(v),
            message: 'Invalid contact number',
        },
    },
    website: {
        type: String,
        required: [true, 'Website URL is required'],
        validate: {
            validator: (v) => /^(https?:\/\/)?([a-z0-9\-\.]+)(\.[a-z]{2,6})(\/[a-z0-9\-._~!$&'()*+,;=:@%]*)*(\?[;&a-z=\d\-_\.]*)?(\#[a-z\d_]*)?$/i.test(v),
            message: 'Invalid website URL',
        },
        trim: true,
    },
    developerBy: {
        type: String,
        required: [true, 'Developer information is required'],
        trim: true,
    },
    _description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true,
    },
}, { timestamps: true });

// Define schema for app settings
const AppSettingSchema = new mongoose.Schema({
    rtl: { type: Boolean, default: false, required: true },
    appMaintenance: { type: Boolean, default: false, required: true },
    googleLogin: { type: Boolean, default: false, required: true },
    firstOpenLogin: { type: Boolean, default: false, required: true },
    screenshotBlock: { type: Boolean, default: false, required: true },
    vpnBlock: { type: Boolean, default: false, required: true },
}, { timestamps: true });

// Define schema for privacy policy
const PrivacyPolicySchema = new mongoose.Schema({
    policy: {
        type: String,
        required: [true, 'Privacy policy is required'],
        trim: true,
    },
}, { timestamps: true });

// Define schema for terms and conditions
const TermsAndConditionsSchema = new mongoose.Schema({
    terms: {
        type: String,
        required: [true, 'Terms and Conditions are required'],
        trim: true,
    },
}, { timestamps: true });

// Define schema for notification settings
const NotificationSchema = new mongoose.Schema({
    oneSignalAppId: {
        type: String,
        required: [true, 'OneSignal App ID is required'],
        trim: true,
    },
    oneSignalAppKey: {
        type: String,
        required: [true, 'OneSignal App Key is required'],
        trim: true,
    },
}, { timestamps: true });

// Define schema for app updates
const AppUpdateSchema = new mongoose.Schema({
    onOff: {
        type: Boolean,
        default: false,
        required: true
    },
    newAppVersion: {
        type: String,
        required: [true, 'New App Version is required'],
        trim: true,
    },
    description_: {
        type: String,
        maxlength: [500, 'Update description cannot exceed 500 characters'],
        trim: true,
    },
    appLink: {
        type: String,
        required: [true, 'App Link is required'],
        validate: {
            validator: (v) => /^(https?:\/\/)?([a-z0-9\-\.]+)(\.[a-z]{2,6})(\/[a-z0-9\-._~!$&'()*+,;=:@%]*)*(\?[;&a-z=\d\-_\.]*)?(\#[a-z\d_]*)?$/i.test(v),
            message: 'Invalid website URL',
        },
        trim: true,
    },
}, { timestamps: true });

// Create models from schemas
const General = mongoose.model('General', GeneralSchema);
const AppSetting = mongoose.model('AppSetting', AppSettingSchema);
const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
const TermsAndConditions = mongoose.model('TermsAndConditions', TermsAndConditionsSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const AppUpdate = mongoose.model('AppUpdate', AppUpdateSchema);

// export model
module.exports = {
    General,
    AppSetting,
    PrivacyPolicy,
    TermsAndConditions,
    Notification,
    AppUpdate
};
