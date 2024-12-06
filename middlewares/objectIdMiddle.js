const mongoose = require('mongoose');

/**
 * Middleware to validate ObjectIds dynamically for specific fields.
 * 
 * @param {Array} fields - List of fields to validate in the request body, query, or params.
 * @param {String} location - The location of the fields to validate ('body', 'query', 'params').
 * @returns Middleware function to validate the ObjectIds.
 */

// **Object id validators**
exports.validateObjectIds = (fields, location = 'body') => {
    return (req, res, next) => {
        const errors = fields
            .filter(field => {
                const value = location === 'body' ? req.body[field] :
                    location === 'query' ? req.query[field] :
                        req.params[field];
                return value && !mongoose.Types.ObjectId.isValid(value);
            })
            .map(field => `Invalid ObjectId for field: ${field}`);

        // If any validation errors, return a 400 response
        if (errors.length) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    };
};
