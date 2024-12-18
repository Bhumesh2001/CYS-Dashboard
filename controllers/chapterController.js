const Chapter = require('../models/Chapter');
const { uploadImage, deleteImage } = require('../utils/image');
const fs = require('fs');

// **Create Chapter**
exports.createChapter = async (req, res, next) => {
    const { subjectId, name, description, status } = req.body;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, messeage: 'No files were uploaded.' });
        };
        const imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysChaptersImg', 220, 200);
        const newChapter = await Chapter.create({
            subjectId,
            name,
            description,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
            status,
        });

        res.status(201).json({
            success: true,
            message: 'Chapter created successfully...!',
            data: newChapter
        });
    } catch (error) {
        next(error);
    };
};

// **Get Chapter by id**
exports.getChapterById = async (req, res, next) => {
    try {
        const chapter = await Chapter.findById(
            req.params.chapterId,
            { createdAt: 0, updatedAt: 0 }
        ).lean();

        if (!Chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

        res.status(200).json({
            success: true,
            message: 'Chapter fetched successfully...!',
            data: chapter
        });
    } catch (error) {
        next(error);
    }
};

// Get Chapters by Subject ID
exports.getChaptersBySubjectId = async (req, res, next) => {
    try {
        // Find active chapters by subjectId
        const chapters = await Chapter.find(
            { subjectId: req.params.subjectId, status: 'Active' },
            { createdAt: 0, updatedAt: 0 },
        );

        // Early return if no chapters found
        if (!chapters.length) return res.status(404).json({
            success: false,
            message: 'No chapters found for this subject'
        });

        // Return the found chapters
        res.status(200).json({
            success: true,
            message: 'Chapters retrieved successfully',
            totalChapters: chapters.length,
            data: chapters
        });

    } catch (error) {
        next(error);
    }
};

// **Get all Chapter**
exports.getAllChapter = async (req, res, next) => {
    try {
        const ChapterData = await Chapter.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        res.status(200).json({
            success: true,
            message: 'Chapteres fetched successfully...!',
            totalChapters: ChapterData.length,
            data: ChapterData
        });
    } catch (error) {
        next(error);
    }
};

// **Update Chapter**
exports.updateChapter = async (req, res, next) => {
    const { subjectId, name, description, status } = req.body;
    try {
        let imageData = {}; // Initialize an empty object to store image data
        if (req.files && Object.keys(req.files).length !== 0) {
            // If a new image is uploaded
            const chapterData = await Chapter.findById(req.params.chapterId, { publicId: 1 });
            if (chapterData && chapterData.publicId) {
                // If the category already has an image, delete the old one
                await deleteImage(chapterData.publicId);
            }
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysChatpersImg', 220, 200);
        } else {
            // If no new image is provided, use the current image data
            const chapterData = await Chapter.findById(req.params.chapterId, { imageUrl: 1, publicId: 1 });
            imageData.url = chapterData.imageUrl;
            imageData.publicId = chapterData.publicId;
        };
        const updatedChapter = await Chapter.findByIdAndUpdate(req.params.chapterId,
            {
                subjectId,
                name,
                description,
                status,
                imageUrl: imageData.url,
                publicId: imageData.publicId
            },
            { new: true, runValidators: true }
        );

        if (!updatedChapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        };

        res.status(200).json({
            success: true,
            message: 'Chapter updated successfully...!',
            data: updatedChapter
        });
    } catch (error) {
        next(error);
    };
};

// **Delete Chapter**
exports.deleteChapter = async (req, res, next) => {
    try {
        const chapterData = await Chapter.findById(req.params.chapterId, { publicId: 1 });
        if (chapterData && chapterData.publicId) await deleteImage(chapterData.publicId);
        
        const deletedChapter = await Chapter.findByIdAndDelete(req.params.chapterId);
        if (!deletedChapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }
        res.status(200).json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        next(error);
    };
};
