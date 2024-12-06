const Chapter = require('../models/Chapter');

// **Create Chapter**
exports.createChapter = async (req, res, next) => {
    try {
        const newChapter = await Chapter.create(req.body);
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
            totalChapter: ChapterData.length,
            data: ChapterData
        });
    } catch (error) {
        next(error);
    }
};

// **Update Chapter**
exports.updateChapter = async (req, res, next) => {
    try {
        const updatedChapter = await Chapter.findByIdAndUpdate(req.params.chapterId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedChapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Chapter updated successfully...!',
            data: updatedChapter
        });
    } catch (error) {
        next(error);
    }
};

// **Delete Chapter**
exports.deleteChapter = async (req, res, next) => {
    try {
        const deletedChapter = await Chapter.findByIdAndDelete(req.params.chapterId);
        if (!deletedChapter) {
            return res.status(404).json({ success: false, message: 'Chapter not found' });
        }
        res.status(200).json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        next(error);
    }
};
