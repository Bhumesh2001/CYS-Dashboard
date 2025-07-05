const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const { uploadImage, deleteImage, uploadPDFToCloudinary } = require('../utils/image');
const { flushAllCache } = require("../middlewares/cacheMiddle");

// **Create Chapter**
exports.createChapter = async (req, res, next) => {
    const { classId, subjectId, name } = req.body;

    try {
        // Initialize image and PDF data as null
        let imageData = { url: null, publicId: null };
        let pdfData = { url: null, publicId: null };

        // Upload image if provided
        if (req.files?.imageUrl) {
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysChaptersImg', 220, 200);
        }

        // Upload PDF if provided
        if (req.files?.pdfUrl) {
            pdfData = await uploadPDFToCloudinary(req.files.pdfUrl.tempFilePath);
        }

        // Create the new chapter document
        const newChapter = await Chapter.create({
            classId,
            subjectId,
            name,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
            pdfUrl: pdfData.url ? { url: pdfData.url, publicId: pdfData.publicId } : null,
        });

        // Clear cache and respond
        flushAllCache();

        res.status(201).json({
            success: true,
            message: 'Chapter created successfully...!',
            data: newChapter
        });
    } catch (error) {
        next(error);
    }
};

// **Get Chapter by id**
exports.getChapterById = async (req, res, next) => {
    try {
        const chapter = await Chapter.findById(
            req.params.chapterId,
            { createdAt: 0, updatedAt: 0, publicId: 0 }
        )
            .populate('classId', 'name')
            .populate('subjectId', 'name')
            .lean();

        if (!Chapter) return res.status(404).json({
            success: false,
            status: 404,
            message: 'Chapter not found'
        });

        res.status(200).json({
            success: true,
            message: 'Chapter fetched successfully...!',
            data: chapter
        });
    } catch (error) {
        next(error);
    };
};

// Get Chapters by Subject ID
exports.getChaptersBySubjectId = async (req, res, next) => {
    try {
        // Find active chapters by subjectId
        const chapters = await Chapter.find({ subjectId: req.params.subjectId })
            .select('-createdAt -updatedAt -publicId')
            .lean();

        // Handle no chapters found
        if (!chapters.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No chapters found for this subject'
            });
        };

        // Respond with found chapters
        res.status(200).json({
            success: true,
            message: 'Chapters retrieved successfully',
            totalChapters: chapters.length,
            data: chapters,
        });
    } catch (error) {
        console.log(error);
        next(error);
    };
};

// Get all chapters by class ID
exports.getChaptersByClassId = async (req, res, next) => {
    try {
        const { classId } = req.params; // Extract classId from request parameters

        // Step 1: Fetch subjects by classId to get their IDs
        const subjects = await Subject.find({ classId }).select('_id').exec();

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No subjects found for this class'
            });
        }

        // Extract subject IDs
        const subjectIds = subjects.map(subject => subject._id);

        // Step 2: Fetch chapters for all subjects (including _id, name, and imageUrl)
        const chapters = await Chapter.find(
            { subjectId: { $in: subjectIds } },
            { name: 1, imageUrl: 1 } // Fetch name and imageUrl; _id is included by default
        ).exec();

        // Step 3: Return the response
        res.status(200).json({
            success: true,
            message: 'Chapters fetched successfully',
            data: chapters, // Directly return the array of chapters
        });
    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
    };
};

// **Get all Chapters**
exports.getAllChapter = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query; // Default to page 1 and limit 10 if not provided

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated data
        const ChapterData = await Chapter.find({}, { name: 1, imageUrl: 1 })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        // Get the total count of chapters
        const totalChapters = await Chapter.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Chapters fetched successfully...!',
            totalChapters,
            totalPages: Math.ceil(totalChapters / pageSize),
            currentPage: pageNumber,
            data: ChapterData,
        });
    } catch (error) {
        next(error);
    };
};

// **Update Chapter**
exports.updateChapter = async (req, res, next) => {
    const { classId, subjectId, name, status } = req.body;

    try {
        // Fetch the existing chapter
        const existingChapter = await Chapter.findById(req.params.chapterId);
        if (!existingChapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }

        // Helper function to handle image and PDF upload
        const handleFileUpload = async (fileKey, folder, isPDF = false) => {
            const file = req.files?.[fileKey];

            // If a new file is uploaded, delete the old one and upload the new one
            if (file) {
                if (existingChapter?.[isPDF ? 'pdfUrl' : 'publicId']) {
                    await deleteImage(existingChapter[isPDF ? 'pdfUrl' : 'publicId']);
                }
                return isPDF
                    ? await uploadPDFToCloudinary(file.tempFilePath)
                    : await uploadImage(file.tempFilePath, folder, 220, 200);
            }

            // If no new file is provided, retain existing data
            return isPDF
                ? existingChapter.pdfUrl
                : { url: existingChapter.imageUrl, publicId: existingChapter.publicId };
        };

        // Process image and PDF
        const imageData = await handleFileUpload('imageUrl', 'CysChaptersImg');
        const pdfData = await handleFileUpload('pdfUrl', null, true);

        // Update chapter with new or existing data
        const updatedChapter = await Chapter.findByIdAndUpdate(
            req.params.chapterId,
            {
                classId,
                subjectId,
                name,
                status,
                imageUrl: imageData?.url || null,
                publicId: imageData?.publicId || null,
                pdfUrl: pdfData?.url ? { url: pdfData.url, publicId: pdfData.publicId } : null,
            },
            { new: true, runValidators: true }
        );

        flushAllCache();
        res.status(200).json({
            success: true,
            message: 'Chapter updated successfully...!',
            data: updatedChapter,
        });
    } catch (error) {
        next(error);
    }
};

// **Delete Chapter**
exports.deleteChapter = async (req, res, next) => {
    try {
        const chapterData = await Chapter.findById(req.params.chapterId, { publicId: 1 });
        if (chapterData && chapterData.publicId) await deleteImage(chapterData.publicId);

        const deletedChapter = await Chapter.findByIdAndDelete(req.params.chapterId);
        if (!deletedChapter) {
            return res.status(404).json({ success: false, status: 404, message: 'Chapter not found' });
        };

        flushAllCache();

        res.status(200).json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        next(error);
    };
};
