const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

// validation
const permissionValidation = require('../validation/validator');
const { validateFields } = require('../middlewares/validateMiddle');

// **Authentication and authorization**
const { authenticate, authorize } = require('../middlewares/authMiddle');

// **Create a Permission**
router.post('/', authenticate, authorize(['admin']), permissionController.createPermission);

// **Get all Permissions**
router.get('/', authenticate, authorize(['admin']), permissionController.getPermissions);

// **Get Permissions by Role**
router.get('/:role', authenticate, authorize(['admin']), permissionController.getPermissionsByRole);

// **Update Permissions by Role**
router.put('/:role', authenticate, authorize(['admin']), permissionController.updatePermissions);

// **Delete Permissions by Role**
router.delete('/:role', authenticate, authorize(['admin']), permissionController.deletePermissions);

module.exports = router;
