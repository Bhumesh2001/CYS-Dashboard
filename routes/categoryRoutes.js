const express = require('express');
const router = express.Router();

// **Category Controller and Authentication, Authorization**
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddle');
const { validateObjectIds } = require('../middlewares/objectIdMiddle');
const { validateFields } = require('../middlewares/validateMiddle');
const categoryValidation = require('../validation/validator');

// Create a new category
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validateFields(categoryValidation.categoryValidationRule),
    categoryController.createCategory
);

// Get all categories
router.get('/', authenticate, categoryController.getAllCategories);

// Get a category by ID
router.get(
    '/:categoryId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['categoryId'], 'params'),
    categoryController.getCategoryById
);

// Update a category by ID
router.put(
    '/:categoryId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['categoryId'], 'params'),
    validateFields(categoryValidation.categoryValidationRule),
    categoryController.updateCategory
);

// Delete a category by ID
router.delete(
    '/:categoryId',
    authenticate,
    authorize(['admin']),
    validateObjectIds(['categoryId'], 'params'),
    categoryController.deleteCategory
);

module.exports = router;
