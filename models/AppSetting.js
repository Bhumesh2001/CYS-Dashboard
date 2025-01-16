const mongoose = require('mongoose');

// Define schema for general settings
const GeneralSchema = new mongoose.Schema({
    email: {
        type: String,
        index: true,
    },
    author: {
        type: String,
    },
    contact: {
        type: String,
    },
    website: {
        type: String,
    },
    developerBy: {
        type: String,
    },
    _description: {
        type: String,
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
    },
}, { timestamps: true });

// Define schema for terms and conditions
const TermsAndConditionsSchema = new mongoose.Schema({
    terms: {
        type: String,
    },
}, { timestamps: true });

// Define schema for notification settings
const NotificationSchema = new mongoose.Schema({
    oneSignalAppId: {
        type: String,
    },
    oneSignalAppKey: {
        type: String,
    },
}, { timestamps: true });

// Define schema for app updates
const AppUpdateSchema = new mongoose.Schema({
    onOff: {
        type: Boolean,
        default: false,
    },
    newAppVersion: {
        type: String,
    },
    description_: {
        type: String,
    },
    appLink: {
        type: String,
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
