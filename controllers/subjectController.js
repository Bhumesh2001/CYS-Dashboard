const Subject = require('../models/Subject');
const { uploadImage, deleteImage } = require('../utils/image');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

// **Create Subject**
exports.createSubject = async (req, res, next) => {
    const { classId, name, description, status } = req.body;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, messeage: 'No files were uploaded.' });
        };

        const imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysSubjectsImg', 220, 200);
        const newSubject = await Subject.create({
            classId,
            name,
            description,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
            status,
        });

        flushCacheByKey('/api/subjects');

        res.status(201).json({
            success: true,
            message: 'Subject created successfully...!',
            data: newSubject
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
            { createdAt: 0, updatedAt: 0, __v: 0 }
        ).lean();

        if (!subject) res.status(404).json({ success: false, message: "Subject not found" });

        res.status(200).json({
            success: true,
            message: 'Subject fetched successfully...!',
            subject,
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

// **Get all subjects**
exports.getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully...!',
            totalSubjects: subjects.length,
            data: subjects
        });
    } catch (error) {
        next(error);
    };
};

// **Update Subject**
exports.updateSubject = async (req, res, next) => {
    const { classId, name, description, status } = req.body;
    try {
        let imageData = {}; // Initialize an empty object to store image data
        if (req.files && Object.keys(req.files).length !== 0) {
            // If a new image is uploaded
            const subjectData = await Subject.findById(req.params.subjectId, { publicId: 1 });
            if (subjectData && subjectData.publicId) {
                // If the category already has an image, delete the old one
                await deleteImage(subjectData.publicId);
            };
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysSubjectsImg', 220, 200);
        } else {
            // If no new image is provided, use the current image data
            const subjectData = await Subject.findById(req.params.subjectId, { imageUrl: 1, publicId: 1 });
            imageData.url = subjectData.imageUrl;
            imageData.publicId = subjectData.publicId;
        };
        const updatedSubject = await Subject.findByIdAndUpdate(req.params.subjectId,
            {
                classId,
                name,
                imageUrl: imageData.url,
                publicId: imageData.publicId,
                description,
                status,
            },
            { new: true, runValidators: true }
        );
        if (!updatedSubject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        };

        flushCacheByKey('/api/subjects');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({
            success: true,
            message: 'Subject Updated successfully...!',
            data: updatedSubject
        });
    } catch (error) {
        next(error);
    };
};

// **Delete Subject**
exports.deleteSubject = async (req, res, next) => {
    try {
        const subjectData = await Subject.findById(req.params.subjectId, { publicId: 1 });
        if (subjectData && subjectData.publicId) await deleteImage(subjectData.publicId);

        const deletedSubject = await Subject.findByIdAndDelete(req.params.subjectId);
        if (!deletedSubject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        };

        flushCacheByKey('/api/subjects');
        flushCacheByKey(req.originalUrl);

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        next(error);
    };
};
