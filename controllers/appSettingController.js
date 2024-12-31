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
    try {
        const { onOff, newAppVersion, description_, appLink } = req.body;

        // Check if the document exists
        const existingAppUpdate = await AppUpdate.findOne();

        if (existingAppUpdate) {
            // Update existing document
            existingAppUpdate.onOff = onOff;
            existingAppUpdate.newAppVersion = newAppVersion;
            existingAppUpdate.description_ = description_;
            existingAppUpdate.appLink = appLink;

            await existingAppUpdate.save();

            return res.status(200).json({
                success: true,
                message: 'App update settings updated successfully.',
                data: existingAppUpdate,
            });
        } else {
            // Create a new document
            const newAppUpdate = new AppUpdate({
                onOff,
                newAppVersion,
                description_,
                appLink,
            });

            await newAppUpdate.save();

            res.status(201).json({
                success: true,
                message: 'App update settings created successfully.',
                data: newAppUpdate,
            });
        }
    } catch (error) {
        next(error);
    };
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
    try {
        const { oneSignalAppId, oneSignalAppKey } = req.body;

        // Check if a notification settings document already exists
        const existingNotification = await Notification.findOne();

        if (existingNotification) {
            // Update the existing document
            existingNotification.oneSignalAppId = oneSignalAppId;
            existingNotification.oneSignalAppKey = oneSignalAppKey;

            await existingNotification.save();

            return res.status(200).json({
                success: true,
                message: 'Notification settings updated successfully.',
                data: existingNotification,
            });
        } else {
            // Create a new document
            const newNotification = new Notification({
                oneSignalAppId,
                oneSignalAppKey,
            });

            await newNotification.save();

            return res.status(201).json({
                success: true,
                message: 'Notification settings created successfully.',
                data: newNotification,
            });
        }
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
    try {
        const { terms } = req.body;

        // Check for existing document
        const existingTerms = await TermsAndConditions.findOne();

        if (existingTerms) {
            // Update the existing document
            existingTerms.terms = terms;
            await existingTerms.save();

            return res.status(200).json({
                success: true,
                message: 'Terms and conditions updated successfully.',
                data: existingTerms,
            });
        } else {
            // Create a new document
            const newTerms = new TermsAndConditions({ terms });
            await newTerms.save();

            return res.status(201).json({
                success: true,
                message: 'Terms and conditions created successfully.',
                data: newTerms,
            });
        }
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
    try {
        const { policy } = req.body;

        // Check for existing document
        const existingPolicy = await PrivacyPolicy.findOne();

        if (existingPolicy) {
            // Update the existing document
            existingPolicy.policy = policy;
            await existingPolicy.save();

            return res.status(200).json({
                success: true,
                message: 'Privacy policy updated successfully.',
                data: existingPolicy,
            });
        } else {
            // Create a new document
            const newPolicy = new PrivacyPolicy({ policy });
            await newPolicy.save();

            return res.status(201).json({
                success: true,
                message: 'Privacy policy created successfully.',
                data: newPolicy,
            });
        }
    } catch (error) {
        next(error);
    }
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
    try {
        const { email, author, contact, website, developerBy, _description } = req.body;

        // Check for existing settings
        const existingSettings = await General.findOne();

        if (existingSettings) {
            // Update the existing document
            existingSettings.email = email;
            existingSettings.author = author;
            existingSettings.contact = contact;
            existingSettings.website = website;
            existingSettings.developerBy = developerBy;
            existingSettings._description = _description;
            await existingSettings.save();

            return res.status(200).json({
                success: true,
                message: 'General settings updated successfully.',
                data: existingSettings,
            });
        } else {
            // Create a new document
            const newSettings = new General({
                email,
                author,
                contact,
                website,
                developerBy,
                _description,
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
    }
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
    try {
        const {
            rtl,
            appMaintenance,
            googleLogin,
            firstOpenLogin,
            screenshotBlock,
            vpnBlock,
        } = req.body;

        // Update or create a single document
        const appSetting = await AppSetting.findOneAndUpdate(
            {}, // Empty filter ensures only one document is updated
            {
                $set: { // $set ensures only specified fields are updated
                    rtl,
                    appMaintenance,
                    googleLogin,
                    firstOpenLogin,
                    screenshotBlock,
                    vpnBlock,
                },
            },
            { upsert: true, new: true } // Creates a new doc if not found
        );

        res.status(200).json({
            success: true,
            message: 'App settings updated successfully.',
            data: appSetting,
        });
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
