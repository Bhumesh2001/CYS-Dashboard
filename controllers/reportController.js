const Report = require('../models/Report');

// Create a new report
exports.createReport = async (req, res, next) => {
    try {
        const { reportedId, reportedModel, reporterId, reason } = req.body;
        const report = await Report.create({ reportedId, reportedModel, reporterId, reason });
        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// Get all reports
exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find({}, { updatedAt: 0 })
        .populate('reporterId', 'fullName createdAt')
        .lean();
        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully',
            totalReports: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// Get a report by ID
exports.getReportById = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.reportId, { createdAt: 0, updatedAt: 0 }).lean();
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.status(200).json({ success: true, message: "Report fetched successfully...!", data: report });
    } catch (error) {
        next(error);
    }
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
        res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        next(error);
    }
};
