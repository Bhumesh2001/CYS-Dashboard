// **Centralize middleware for error handing**
exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            // Mongoose validation error
            const errors = Object.values(err.errors).map((el) => el.message);
            return res.status(422).json({
                success: false,
                status: 422,
                message: `Validation error: ${errors.join(', ')}`,
            });
        case 'CastError':
            // Mongoose invalid ObjectId
            return res.status(422).json({
                success: false,
                status: 422,
                message: `Invalid ${err.path}: ${err.value}`,
            });
        case 'SyntaxError':
            if (err.type === 'entity.parse.failed') {
                // JSON syntax error in the request body
                return res.status(422).json({
                    success: false,
                    status: 422,
                    message: 'Invalid JSON syntax in request body.',
                });
            }
            break;
        case 'TokenExpiredError':
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Token has expired. Please log in again.',
            });
        case 'JsonWebTokenError':
            return res.status(422).json({
                success: false,
                status: 422,
                message: 'Invalid token. Please log in again.',
            });
        default:
            if (err.code && err.code === 11000) {
                // Mongoose duplicate key error
                const field = Object.keys(err.keyValue).join(', ');
                return res.status(422).json({
                    success: false,
                    status: 422,
                    message: `Duplicate field value: '${field}' already exists.`,
                });
            } else if (err.type === 'entity.too.large') {
                // Payload too large error
                return res.status(413).json({
                    success: false,
                    status: 413,
                    message: 'Payload size exceeds the allowed limit.',
                });
            } else {
                return res.status(statusCode).json({
                    success: false,
                    status: statusCode,
                    message,
                });
            };
    };
};