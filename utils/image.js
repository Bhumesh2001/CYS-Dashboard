const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// upload image to cloudinary
exports.uploadImage = async (file, folder, width, height) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder || 'default-folder', // Dynamically specify folder
            resource_type: 'image', // For image files
            transformation: [
                {
                    width: width || undefined, // Use specified width or keep original
                    height: height || undefined, // Use specified height or keep original
                    crop: "limit", // Prevent upscaling beyond original dimensions
                    quality: "auto:best", // Store in the highest quality suitable
                    fetch_format: "auto", // Automatically select the best format (e.g., WebP)
                },
            ],
        });
        return {
            publicId: result.public_id,
            url: result.secure_url,
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Image upload failed');
    };
};

// delete image to cloudinary
exports.deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            return { success: true, message: 'Image deleted successfully' };
        }
        throw new Error('Image deletion failed');
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new Error('Image deletion failed');
    };
};

// Function to upload a PDF to Cloudinary
exports.uploadPDFToCloudinary = async (pdfPath) => {
    try {
        // Use a promise to handle async file upload
        const uploadResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: "CysPdfs" },
                (error, result) => {
                    if (error) {
                        reject(error);  // Reject if an error occurs
                    } else {
                        resolve(result);  // Resolve if the upload is successful
                    }
                }
            );

            // Pipe the PDF stream directly to Cloudinary
            fs.createReadStream(pdfPath).pipe(stream);
        });

        // Return the URL and public ID of the uploaded file
        return {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
        };
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;  // Re-throw the error after logging it
    };
};