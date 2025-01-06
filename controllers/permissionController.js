const Permission = require('../models/Permission');

// **Create a Permission**
exports.createPermission = async (req, res, next) => {
    const { role, permissions } = req.body;

    try {
        const newPermission = new Permission({ role, permissions });
        await newPermission.save();
        res.status(201).json({
            success: true,
            message: 'Permission created successfully!',
            data: newPermission
        });
    } catch (error) {
        next(error);
    }
};

// **Get all Permissions**
exports.getPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.find().lean();
        if (!permissions.length) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No permissions found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Permissions fetched successfully',
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

// **Get Permissions by Role**
exports.getPermissionsByRole = async (req, res, next) => {
    const { role } = req.params;

    try {
        const permissions = await Permission.findOne({ role: role.toLowerCase() }).lean();
        if (!permissions) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: `No permissions found for role: ${role}`
            });
        }
        res.status(200).json({
            success: true,
            message: 'Permissions fetched successfully',
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

// **Update Permissions**
exports.updatePermissions = async (req, res, next) => {
    const { role } = req.params;
    const { permissions } = req.body;

    try {
        const updatedPermission = await Permission.findOneAndUpdate(
            { role: role.toLowerCase() },
            { $set: { permissions } },
            { new: true }
        );
        if (!updatedPermission) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: `No permissions found for role: ${role}`
            });
        }
        res.status(200).json({
            success: true,
            message: 'Permissions updated successfully',
            data: updatedPermission
        });
    } catch (error) {
        next(error);
    }
};

// **Delete Permissions**
exports.deletePermissions = async (req, res, next) => {
    const { role } = req.params;

    try {
        const deletedPermission = await Permission.findOneAndDelete({ role: role.toLowerCase() });
        if (!deletedPermission) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: `No permissions found for role: ${role}`
            });
        }
        res.status(200).json({
            success: true,
            message: 'Permissions deleted successfully',
            data: deletedPermission
        });
    } catch (error) {
        next(error);
    }
};
