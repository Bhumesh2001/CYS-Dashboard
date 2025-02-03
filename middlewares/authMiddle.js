const jwt = require('jsonwebtoken');
const User = require('../models/User');

// **Authentication Middleware**
exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1] ||
        req.cookies.user_token ||
        req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            status: 401,
            message: 'Access Denied'
        });
    };

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(verified.id).lean();
        next();
    } catch (error) {
        next(error);
    };
};

// **Authorization Middleware**
exports.authorize = (roles = []) => {
    return (req, res, next) => {
        // Check if roles are provided and user's role is in the allowed list
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: 'Permission Denied!'
            });
        }
        next();
    };
};
