const {
    General,
    AppSetting,
    PrivacyPolicy,
    TermsAndConditions,
    Notification,
    AppUpdate
} = require('../models/AppSetting');

// Create or Update App Update
exports.createOrUpdateAppUpdate = async (req, res, next) => {
    const { isUpdateEnabled, newAppVersion, description_, appLink } = req.body;

    try {
        const appUpdate = await AppUpdate.findOneAndUpdate(
            {},
            { isUpdateEnabled, newAppVersion, description_, appLink },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'App update settings updated successfully', data: appUpdate });
    } catch (error) {
        next(error);
    }
};

// Get App Update
exports.getAppUpdate = async (req, res, next) => {
    try {
        const appUpdate = await AppUpdate.findOne({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        if (!appUpdate) return res.status(404).json({ success: false, message: 'App update settings not found' });
        res.status(200).json({
            success: true,
            message: "App update setting fetched successfully...!",
            data: appUpdate
        });
    } catch (error) {
        next(error);
    };
};

// Create or Update Notification Settings
exports.createOrUpdateNotification = async (req, res, next) => {
    const { oneSignalAppId, oneSignalAppKey } = req.body;

    try {
        const notification = await Notification.findOneAndUpdate(
            {},
            { oneSignalAppId, oneSignalAppKey },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'Notification settings updated successfully', data: notification });
    } catch (error) {
        next(error);
    }
};

// Get Notification Settings
exports.getNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        if (!notification) return res.status(404).json({ success: false, message: 'Notification settings not found' });
        res.status(200).json({
            success: true,
            message: "Setting fetched successfully...!",
            data: notification
        });
    } catch (error) {
        next(error);
    };
};

// Create or Update Terms and Conditions
exports.createOrUpdateTerms = async (req, res, next) => {
    const { terms } = req.body;

    try {
        const termsAndConditions = await TermsAndConditions.findOneAndUpdate(
            {},
            { terms },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'Terms and conditions updated successfully', data: termsAndConditions });
    } catch (error) {
        next(error);
    }
};

// Get Terms and Conditions
exports.getTerms = async (req, res, next) => {
    try {
        const termsAndConditions = await TermsAndConditions.findOne(
            {},
            { createdAt: 0, updatedAt: 0, __v: 0 }
        ).lean();
        if (!termsAndConditions) return res.status(404).json({
            success: false,
            message: 'Terms and conditions not found'
        });
        res.status(200).json({
            success: true,
            message: "Terms & condition fetched successfully...!",
            data: termsAndConditions
        });
    } catch (error) {
        next(error);
    };
};

// Create or Update Privacy Policy
exports.createOrUpdatePrivacyPolicy = async (req, res, next) => {
    const { policy } = req.body;

    try {
        const privacyPolicy = await PrivacyPolicy.findOneAndUpdate(
            {},
            { policy },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'Privacy policy updated successfully', data: privacyPolicy });
    } catch (error) {
        next(error);
    };
};

// Get Privacy Policy
exports.getPrivacyPolicy = async (req, res, next) => {
    try {
        const privacyPolicy = await PrivacyPolicy.findOne({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        if (!privacyPolicy) return res.status(404).json({ success: false, message: 'Privacy policy not found' });
        res.status(200).json({
            success: true,
            message: "Privacy Policy fetched successfully...!",
            data: privacyPolicy
        });
    } catch (error) {
        next(error);
    };
};

// Create or Update General Settings
exports.createOrUpdateGeneral = async (req, res, next) => {
    const { email, author, contact, website, developerBy, _description } = req.body;

    try {
        const general = await General.findOneAndUpdate(
            {},
            { email, author, contact, website, developerBy, _description },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'General settings updated successfully', data: general });
    } catch (error) {
        next(error);
    };
};

// Get General Settings
exports.getGeneral = async (req, res, next) => {
    try {
        const general = await General.findOne({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        if (!general) return res.status(404).json({ success: false, message: 'General settings not found' });
        res.status(200).json({ success: true, message: "Setting fetched successfully...!", data: general });
    } catch (error) {
        next(error);
    }
};

// Create or Update App Settings
exports.createOrUpdateAppSetting = async (req, res, next) => {
    const { rtl, appMaintenance, googleLogin, firstOpenLogin, screenshotBlock, vpnBlock } = req.body;

    try {
        const appSetting = await AppSetting.findOneAndUpdate(
            {},
            { rtl, appMaintenance, googleLogin, firstOpenLogin, screenshotBlock, vpnBlock },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'App settings updated successfully', data: appSetting });
    } catch (error) {
        next(error);
    }
};

// Get App Settings
exports.getAppSetting = async (req, res, next) => {
    try {
        const appSetting = await AppSetting.findOne({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        if (!appSetting) return res.status(404).json({ success: false, message: 'App settings not found' });
        res.status(200).json({
            success: true,
            message: "App setting fetched successfully...!",
            data: appSetting
        });
    } catch (error) {
        next(error);
    }
};
