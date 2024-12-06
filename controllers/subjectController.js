const Subject = require('../models/Subject');

// **Create Subject**
exports.createSubject = async (req, res, next) => {
    try {
        const newSubject = await Subject.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Subject created successfully...!',
            data: newSubject
        });
    } catch (error) {
        next(error);
    }
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
            { createdAt: 0, updatedAt: 0 },
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
    }
};

// **Get all subjects**
exports.getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
        res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully...!',
            totalSubjects: subjects.length,
            subjects
        });
    } catch (error) {
        next(error);
    }
};

// **Update Subject**
exports.updateSubject = async (req, res, next) => {
    try {
        const updatedSubject = await Subject.findByIdAndUpdate(req.params.subjectId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedSubject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Subject Updated successfully...!',
            data: updatedSubject
        });
    } catch (error) {
        next(error);
    }
};

// **Delete Subject**
exports.deleteSubject = async (req, res, next) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.subjectId);
        if (!deletedSubject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        next(error);
    }
};
