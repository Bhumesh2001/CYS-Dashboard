const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../utils/image');
const fs = require('fs');

// Create a new category
exports.createCategory = async (req, res, next) => {
    const { name, description, status } = req.body;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, messeage: 'No files were uploaded.' });
        };
        const imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysCategoriesImg', 220, 200);
        const category = await Category.create({
            name,
            description,
            imageUrl: imageData.url,
            publicId: imageData.publicId,
            status
        });
        // Cleanup temporary file
        fs.unlink(req.files.imageUrl.tempFilePath, (err) => {
            if (err) console.error('Failed to delete temp file:', err);
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully...!",
            data: category
        });
    } catch (error) {
        next(error);
    };
};

// Get all categories
exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully...!",
            totalCategories: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// Get a category by ID
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(
            req.params.categoryId,
            { createdAt: 0, updatedAt: 0, __v: 0 }
        ).lean();

        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        res.status(200).json({
            success: true,
            message: "Category fetched successfully...!",
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// Update a category by ID
exports.updateCategory = async (req, res, next) => {
    const { name, description, status } = req.body;
    try {
        let imageData = {}; // Initialize an empty object to store image data
        if (req.files && Object.keys(req.files).length !== 0) {
            // If a new image is uploaded
            const categoryData = await Category.findById(req.params.categoryId, { publicId: 1 });
            if (categoryData && categoryData.publicId) {
                // If the category already has an image, delete the old one
                await deleteImage(categoryData.publicId);
            }
            imageData = await uploadImage(req.files.imageUrl.tempFilePath, 'CysCategoriesImg', 220, 200);
            // Cleanup temporary file
            fs.unlink(req.files.imageUrl.tempFilePath, (err) => {
                if (err) console.error('Failed to delete temp file:', err);
            });
        } else {
            // If no new image is provided, use the current image data
            const categoryData = await Category.findById(req.params.categoryId, { imageUrl: 1, publicId: 1 });
            imageData.url = categoryData.imageUrl;
            imageData.publicId = categoryData.publicId;
        };

        // Update category with name, description, status, and image data
        const category = await Category.findByIdAndUpdate(
            req.params.categoryId,
            {
                name,
                description,
                status,
                imageUrl: imageData.url,
                publicId: imageData.publicId
            },
            { new: true, runValidators: true }
        );

        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully!',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res, next) => {
    try {
        const categoryData = await Category.findById(req.params.categoryId, { publicId: 1 });
        if (categoryData && categoryData.publicId) await deleteImage(categoryData.publicId);

        const category = await Category.findByIdAndDelete(req.params.categoryId);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};
