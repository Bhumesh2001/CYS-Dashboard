const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            message: "Category created successfully...!",
            data: category
        });
    } catch (error) {
        next(error);
    }
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
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.categoryId, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ 
            success: true, 
            message: 'Category updated successfully...!',
            data: category 
        });
    } catch (error) {
        next(error);
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.categoryId);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};