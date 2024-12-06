const admin = require('../config/firebaseConfig');

// **Send notification to All**
exports.sendNotificationToAll = async (req, res, next) => {
    const { title, message } = req.body;

    try {
        const payload = {
            notification: {
                title,
                body: message,
            },
        };

        const response = await admin.messaging().send({
            topic: 'allUsers', // Name of the topic
            ...payload,
        });

        res.status(200).json({
            success: true,
            message: 'Notification sent to all users',
            response,
        });
    } catch (error) {
        next(error);
    }
};

// **Send notification to Single User**
exports.sendNotificationToUser = async (req, res, next) => {
    const { token, title, message } = req.body;

    try {
        const payload = {
            notification: {
                title,
                body: message,
            },
            token, // The user's device token
        };

        const response = await admin.messaging().send(payload);
        res.status(200).json({
            success: true,
            message: 'Notification sent to the user',
            response,
        });
    } catch (error) {
        next(error);
    }
};
