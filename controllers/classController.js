const Class = require('../models/Class');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

// **Create Class**
exports.createClass = async (req, res, next) => {
    try {
        const newClass = await Class.create(req.body);
        flushCacheByKey('/api/classes');
        res.status(201).json({
            success: true,
            message: 'Class created successfully...!',
            data: newClass
        });
    } catch (error) {
        next(error);
    };
};

// **Get all Classes**
exports.getAllClasses = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated data
        const classes = await Class.find({}, { name: 1, status: 1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        // Get the total count of classes
        const totalClasses = await Class.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Classes fetched successfully...!',
            totalClasses,
            totalPages: Math.ceil(totalClasses / pageSize),
            currentPage: pageNumber,
            data: classes,
        });
    } catch (error) {
        next(error);
    };
};

// **Get class by ID**
exports.getClassById = async (req, res, next) => {
    try {
        const classData = await Class.findById(
            req.params.classId,
            { createdAt: 0, updatedAt: 0, __v: 0 }
        ).lean();

        if (!classData) return res.status(404).json({ success: false, message: 'Class not found!' });

        res.status(200).json({
            success: true,
            message: 'Class fetched successfully...!',
            data: classData,
        });
    } catch (error) {
        next(error);
    }
};

// **Update Class**
exports.updateClass = async (req, res, next) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.classId, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Run validation checks on the updated data
        });
        if (!updatedClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        };
        flushCacheByKey('/api/classes');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({
            success: true,
            message: 'Class updated successfully...!',
            data: updatedClass
        });
    } catch (error) {
        next(error);
    }
};

// **Delete Class**
exports.deleteClass = async (req, res, next) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.classId);
        if (!deletedClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        };
        flushCacheByKey('/api/classes');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        next(error);
    }
};
