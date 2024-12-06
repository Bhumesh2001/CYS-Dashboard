const { validationResult } = require('express-validator');

/**
 * Middleware for validating dynamic express-validator rules
 * @param {Array} validationRules - The array of validation rules to apply.
 */

// **Validate fileds dynamically**
exports.validateFields = (validationRules) => {
    return [
        ...validationRules, // Add the dynamic validation rules provided by the route
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }
            next();
        },
    ];
};
