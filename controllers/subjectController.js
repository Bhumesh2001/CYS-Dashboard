const Subject = require('../models/Subject');
const { uploadImage, deleteImage, uploadPDFToCloudinary } = require('../utils/image');
const { flushAllCache } = require("../middlewares/cacheMiddle");

// **Create Subject**
exports.createSubject = async (req, res, next) => {
    const { classId, name, description, status } = req.body;

    try {
        // Upload image and PDF (if available)
        const imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysSubjectsImg', 220, 200);

        // Create the new subject document
        const newSubject = await Subject.create({
            classId,
            name,
            description,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
            status,
        });

        // Clear cache and respond
        flushAllCache();
        res.status(201).json({
            success: true,
            message: 'Subject created successfully!',
            data: newSubject,
        });
    } catch (error) {
        next(error);
    };
};

// **Get Subject by id**
exports.getSubjectById = async (req, res, next) => {
    try {
        const subject = await Subject.findById(
            req.params.subjectId,
            { createdAt: 0, updatedAt: 0, __v: 0, publicId: 0 }
        )
            .populate('classId', 'name')
            .lean();

        if (!subject) res.status(404).json({ success: false, message: "Subject not found" });

        res.status(200).json({
            success: true,
            message: 'Subject fetched successfully...!',
            data: subject,
        });
    } catch (error) {
        next(error);
    }
};

// Get Subjects by Class ID
exports.getSubjectByClassId = async (req, res, next) => {
    try {
        // Find active subjects by classId
        const subjects = await Subject.find(
            { classId: req.params.classId, status: 'Active' },
            { createdAt: 0, updatedAt: 0, publicId: 0 },
        ).lean();

        // Early return if no subjects found
        if (!subjects.length) return res.status(404).json({
            success: false,
            status: 404,
            message: 'No subjects found for this class'
        });

        // Return the found subjects
        res.status(200).json({
            success: true,
            message: 'Subjects retrieved successfully',
            totalSubjects: subjects.length,
            data: subjects
        });

    } catch (error) {
        next(error);
    };
};

// **Get all subjects with pagination**
exports.getAllSubjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated subjects
        const subjects = await Subject.find(
            {},
            { name: 1, imageUrl: 1 }
        )
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize) // Skip for pagination
            .limit(pageSize) // Limit the number of results
            .lean();

        // Get the total count of subjects
        const totalSubjects = await Subject.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully...!',
            totalSubjects,
            totalPages: Math.ceil(totalSubjects / pageSize),
            currentPage: pageNumber,
            data: subjects,
        });
    } catch (error) {
        next(error);
    };
};

// **Update Subject**
exports.updateSubject = async (req, res, next) => {
    const { classId, name, description, status } = req.body;

    try {
        const file = req.files?.imageUrl;

        // Fetch existing subject and handle image
        const existingSubject = await Subject.findById(req.params.subjectId, 'imageUrl publicId');
        if (!existingSubject) return res.status(404).json({ success: false, message: 'Subject not found' });

        let imageData = existingSubject.imageUrl || { url: null, publicId: null };

        if (file) {
            if (imageData.publicId) await deleteImage(imageData.publicId);
            imageData = await uploadImage(file.tempFilePath, 'CysSubjectsImg', 220, 200);
        };

        // Update subject
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.subjectId,
            { classId, name, description, status, imageUrl: imageData.url, publicId: imageData.publicId },
            { new: true, runValidators: true }
        );

        flushAllCache();

        res.status(200).json({
            success: true,
            message: 'Subject updated successfully!',
            data: updatedSubject,
        });
    } catch (error) {
        next(error);
    };
};

// **Delete Subject**
exports.deleteSubject = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        // Delete subject and get publicId in a single query
        const subjectData = await Subject.findByIdAndDelete(subjectId, { publicId: 1 });

        if (!subjectData) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        };

        // Delete associated image if publicId exists
        if (subjectData.publicId) {
            try {
                await deleteImage(subjectData.publicId);
            } catch (err) {
                console.error('Image deletion failed:', err.message);
            };
        };

        // Clear cache for subjects and the current URL
        flushAllCache();

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        next(error); // Handle unexpected errors
    };
};
