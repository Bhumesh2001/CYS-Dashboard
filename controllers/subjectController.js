const Subject = require('../models/Subject');
const { uploadImage, deleteImage, uploadPDFToCloudinary } = require('../utils/image');
const { flushCacheByKey } = require("../middlewares/cacheMiddle");

// **Create Subject**
exports.createSubject = async (req, res, next) => {
    const { classId, name, description, status } = req.body;

    try {
        // Check for files in the request
        if (!req.files?.imageUrl) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        };

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
        flushCacheByKey('/api/subjects');
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

// **Get all subjects**
exports.getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.find({}, { createdAt: 0, updatedAt: 0, __v: 0, publicId: 0 }).lean();
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
        // Helper function to process file upload or fetch existing data
        const processUpload = async (fileKey, folder, defaultDimensions) => {
            const file = req.files?.[fileKey];
            if (!file) return { url: null, publicId: null };

            const existingData = await Subject.findById(req.params.subjectId, { [fileKey]: 1 });
            if (existingData?.[fileKey]?.publicId) await deleteImage(existingData[fileKey].publicId);

            const uploadData = fileKey === 'imageUrl'
                ? await uploadImage(file.tempFilePath, folder, ...defaultDimensions)
                : null;

            return uploadData || { url: null, publicId: null };
        };

        // Process Image
        const imageData = await processUpload('imageUrl', 'CysSubjectsImg', [220, 200]);

        // Update subject with new data (no PDF update)
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.subjectId,
            {
                classId,
                name,
                description,
                status,
                imageUrl: imageData.url,
                publicId: imageData.publicId,
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubject) return res.status(404).json({ success: false, message: 'Subject not found' });

        // Clear caches and respond
        flushCacheByKey('/api/subjects');
        flushCacheByKey(req.originalUrl);

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
        try {
            await Promise.all(['/api/subjects', req.originalUrl].map(key => flushCacheByKey(key)));
        } catch (err) {
            console.error('Cache clearing failed:', err.message);
        };

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        next(error); // Handle unexpected errors
    };
};
