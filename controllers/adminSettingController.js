const { GeneralSettings, SmtpSettings } = require('../models/AdminSetting');
const { uploadImage, deleteImage } = require('../utils/image');

// **General Settings**
exports.createOrUpdateGeneralSettings = async (req, res, next) => {
    try {
        const { siteName } = req.body;
        const { siteLogo } = req.files || {}; // Destructure siteLogo from req.files directly

        // Ensure siteName is provided
        if (!siteName) {
            return res.status(400).json({
                success: false,
                message: 'Site Name is required!',
            });
        };

        // Fetch existing settings to handle logo if needed
        const existingSettings = await GeneralSettings.findOne({}, { siteLogo: 1, publicId: 1 }).lean();
        let logoUrl = existingSettings?.siteLogo;
        let publicId = existingSettings?.publicId;

        // If new logo is provided, upload it and delete the old one
        if (siteLogo) {
            if (publicId) {
                await deleteImage(publicId); // Delete old logo if it exists
            };

            const { url, publicId: newPublicId } = await uploadImage(siteLogo.tempFilePath, 'CysSiteLogos', 250, 150);
            logoUrl = url;
            publicId = newPublicId;
        };

        // Update or create settings in one query
        const updatedSettings = await GeneralSettings.findOneAndUpdate(
            {},
            { siteName, siteLogo: logoUrl, publicId },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'General settings saved successfully.',
            data: updatedSettings,
        });
    } catch (error) {
        next(error);
    };
};

// get general setting
exports.getGeneralSettings = async (req, res, next) => {
    try {
        const settings = await GeneralSettings.findOne({}, { createdAt: 0, updatedAt: 0, publicId: 0 })
            .lean();

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
            { createdAt: 0, updatedAt: 0, },
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

// get smtp setting
exports.getSmtpSettings = async (req, res, next) => {
    try {
        const settings = await SmtpSettings.findOne({}, { createdAt: 0, updatedAt: 0 }).lean();

        if (!settings) {
            return res.status(404).json({ success: false, message: 'SMTP settings not found.' });
        };

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    };
};
