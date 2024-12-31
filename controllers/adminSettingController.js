const { GeneralSettings, SmtpSettings } = require('../models/AdminSetting');
const { uploadImage, deleteImage } = require('../utils/image');

// **General Settings**
exports.createOrUpdateGeneralSettings = async (req, res, next) => {
    try {
        const { siteName } = req.body;
        const { siteLogo } = req.files || {}; // Destructure siteLogo from req.files directly

        // Fetch existing settings to handle logo if needed
        const existingSettings = await GeneralSettings.findOne();

        let logoUrl = existingSettings?.siteLogo || null;
        let publicId = existingSettings?.publicId || null;

        // If new logo is provided, upload it and delete the old one
        if (siteLogo) {
            if (publicId) {
                await deleteImage(publicId); // Delete old logo if it exists
            }

            const { url, publicId: newPublicId } = await uploadImage(
                siteLogo.tempFilePath,
                'CysSiteLogos',
                250,
                150
            );
            logoUrl = url;
            publicId = newPublicId;
        };

        if (existingSettings) {
            // Update the existing document
            existingSettings.siteName = siteName;
            existingSettings.siteLogo = logoUrl;
            existingSettings.publicId = publicId;

            await existingSettings.save();

            return res.status(200).json({
                success: true,
                message: 'General settings updated successfully.',
                data: existingSettings,
            });
        } else {
            // Create a new document if none exists
            const newSettings = new GeneralSettings({
                siteName,
                siteLogo: logoUrl,
                publicId,
            });

            await newSettings.save();

            return res.status(201).json({
                success: true,
                message: 'General settings created successfully.',
                data: newSettings,
            });
        }
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

        // Check if a record already exists
        const existingSettings = await SmtpSettings.findOne();

        if (existingSettings) {
            // Update the existing document
            existingSettings.smtpType = smtpType;
            existingSettings.smtpHost = smtpHost;
            existingSettings.smtpEmail = smtpEmail;
            existingSettings.smtpPassword = smtpPassword;
            existingSettings.smtpSecure = smtpSecure;
            existingSettings.smtpPort = smtpPort;

            await existingSettings.save();

            return res.status(200).json({
                success: true,
                message: 'SMTP settings updated successfully.',
                data: existingSettings,
            });
        } else {
            // Create a new document if none exists
            const newSettings = new SmtpSettings({
                smtpType,
                smtpHost,
                smtpEmail,
                smtpPassword,
                smtpSecure,
                smtpPort,
            });
            await newSettings.save();

            res.status(201).json({
                success: true,
                message: 'SMTP settings created successfully.',
                data: newSettings,
            });
        }
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
