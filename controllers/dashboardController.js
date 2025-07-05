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
        // Fetch counts using aggregation to minimize DB calls
        const stats = await Promise.all([
            Quiz.aggregate([{ $count: "totalQuizzes" }]),
            Chapter.aggregate([{ $count: "totalChapters" }]),
            Report.aggregate([{ $count: "totalReports" }]),
            User.aggregate([{ $match: { role: "user" } }, { $count: "totalUsers" }]),
        ]);

        // Extract counts safely (default to 0 if no documents exist)
        const totalQuizzes = stats[0][0]?.totalQuizzes || 0;
        const totalChapters = stats[1][0]?.totalChapters || 0;
        const totalReports = stats[2][0]?.totalReports || 0;
        const totalUsers = stats[3][0]?.totalUsers || 0;

        res.status(200).json({
            success: true,
            message: "Stats fetched successfully...!",
            data: { totalQuizzes, totalChapters, totalReports, totalUsers },
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
    };
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
            .limit(5) // Limit to 5 users
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
