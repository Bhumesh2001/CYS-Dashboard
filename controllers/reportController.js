const Report = require('../models/Report');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

// Create a new report
exports.createReport = async (req, res, next) => {
    try {
        const { reportedId, reportedModel, reason } = req.body;
        const report = await Report.create({
            reportedId,
            reportedModel,
            reporterId: req.user._id,
            reason
        });

        flushCacheByKey('/api/reports');
        flushCacheByKey('/api/dashboard/stats');

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: report
        });
    } catch (error) {
        next(error);
    };
};

// Get all reports with pagination
exports.getAllReports = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch reports with pagination
        const reports = await Report.find({}, { updatedAt: 0 })
            .populate('reporterId', 'fullName createdAt')
            .skip(skip)
            .limit(Number(limit))
            .lean();

        // Total count for pagination metadata
        const totalReports = await Report.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully',
            totalReports,
            currentPage: Number(page),
            totalPages: Math.ceil(totalReports / limit),
            data: reports
        });
    } catch (error) {
        next(error);
    };
};

// Get a report by ID
exports.getReportById = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.reportId, { createdAt: 0, updatedAt: 0 }).lean();

        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        res.status(200).json({ success: true, message: "Report fetched successfully...!", data: report });
    } catch (error) {
        next(error);
    };
};

// Update report status
exports.updateReportStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.reportId,
            { status },
            { new: true, runValidators: true }
        );
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        flushCacheByKey('/api/reports');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({ success: true, message: "Report updated successfully...!", data: report });
    } catch (error) {
        next(error);
    }
};

// Delete a report by ID
exports.deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.reportId);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        flushCacheByKey('/api/reports');
        flushCacheByKey('/api/dashboard/stats');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        next(error);
    };
};
