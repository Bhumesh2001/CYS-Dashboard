const Report = require('../models/Report');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Chapter = require('../models/Chapter');

const moment = require('moment');

/**
 * Get dashboard statistics.
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Fetch totals
        const [totalQuizzes, totalChapters, totalReports, totalUsers] = await Promise.all([
            Quiz.countDocuments().lean(),
            Chapter.countDocuments().lean(),
            Report.countDocuments().lean(),
            User.countDocuments({ role: 'user' }).lean(),
        ]);

        res.status(200).json({
            success: true,
            message: "Stats fetched successfully...!",
            data: {
                totalQuizzes,
                totalChapters,
                totalReports,
                totalUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user analytics.
 */
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const userAnalytics = await User.aggregate([
            {
                $group: {
                    _id: '$role', // Group by role (admin, user etc.)
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            message: "User analytics fetched successfully...!",
            userAnalytics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get new users in the last 5 days.
 */
exports.getNewUsers = async (req, res, next) => {
    try {
        const fiveDaysAgo = moment().subtract(5, 'days').toDate();

        const newUsers = await User.find({ role: 'user', createdAt: { $gte: fiveDaysAgo } })
            .select('fullName email createdAt profileUrl') // Select relevant fields
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();

        // Convert createdAt to readable date format
        const formattedUsers = newUsers.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt).toISOString().split('T')[0] // Format to YYYY-MM-DD
        }));

        res.status(200).json({
            success: true,
            message: 'New users fetched successfully...!',
            newUsers: formattedUsers
        });
    } catch (error) {
        next(error);
    }
};
