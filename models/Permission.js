const mongoose = require('mongoose');

// Permission schema
const permissionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['admin', 'editor', 'viewer', 'user', 'teacher'], // Define roles
        trim: true, // Trim whitespace
        lowercase: true, // Convert to lowercase
    },
    permissions: [
        {
            resource: {
                type: String,
                required: true, // The URL or resource path
                trim: true, // Trim whitespace
                lowercase: true, // Convert to lowercase
            },
            actions: {
                type: [String],
                required: true,
                enum: ['POST', 'GET', 'PUT', 'DELETE'], // Define actions
                validate: {
                    validator: (v) => v.length > 0,
                    message: 'At least one action is required',
                },
            },
        },
    ],
}, {
    timestamps: true, // Add createdAt and updatedAt fields
    collection: 'permissions', // Specify the collection name
});

// Add indexes to improve query performance
permissionSchema.index({ role: 1 }); // Index on the role field
permissionSchema.index({ 'permissions.resource': 1 }); // Index on resource
permissionSchema.index({ 'permissions.actions': 1 }); // Index on actions

// Add compound index on role and resource for faster querying
permissionSchema.index({ role: 1, 'permissions.resource': 1 });

// Create a model from the schema
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
