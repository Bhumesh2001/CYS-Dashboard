const { GeneralSettings, SmtpSettings } = require('../models/AdminSetting');

// **General Settings**
exports.createOrUpdateGeneralSettings = async (req, res, next) => {
    try {
        const { siteName, siteLogo } = req.body;

        if (!siteName || !siteLogo) {
            return res.status(400).json({ success: false, message: 'Site Name and Site Logo are required.' });
        };

        const updatedSettings = await GeneralSettings.findOneAndUpdate(
            {},
            { siteName, siteLogo },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'General settings saved successfully.',
            data: updatedSettings
        });
    } catch (error) {
        next(error);
    };
};

exports.getGeneralSettings = async (req, res, next) => {
    try {
        const settings = await GeneralSettings.findOne();

        if (!settings) {
            return res.status(404).json({ success: false, message: 'General settings not found.' });
        };

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    };
};

// **SMTP Settings**
exports.createOrUpdateSmtpSettings = async (req, res, next) => {
    try {
        const { smtpType, smtpHost, smtpEmail, smtpPassword, smtpSecure, smtpPort } = req.body;

        if (!smtpType || !smtpHost || !smtpEmail || !smtpPassword || smtpSecure === undefined || !smtpPort) {
            return res.status(400).json({ success: false, message: 'All SMTP fields are required.' });
        };

        const updatedSettings = await SmtpSettings.findOneAndUpdate(
            {},
            { smtpType, smtpHost, smtpEmail, smtpPassword, smtpSecure, smtpPort },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'SMTP settings saved successfully.',
            data: updatedSettings
        });
    } catch (error) {
        next(error);
    };
};

exports.getSmtpSettings = async (req, res, next) => {
    try {
        const settings = await SmtpSettings.findOne();

        if (!settings) {
            return res.status(404).json({ success: false, message: 'SMTP settings not found.' });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    };
};
