const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, storeToken } = require('../utils/token');
const { generateOTP } = require('../utils/otp');
const { sendOTP } = require('../services/emailService');
const { uploadImage, deleteImage } = require('../utils/image');
const { flushCacheByKey } = require('../middlewares/cacheMiddle');

//**Register**
exports.register = async (req, res, next) => {
    const { role = 'user', ...data } = req.body;

    try {
        // Initialize imageData with default values
        let imageData = { url: null, publicId: null };

        // Validate and process the uploaded file if it exists
        if (req.files && req.files.profileUrl && req.files.profileUrl.tempFilePath) {
            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        }

        // Create a new user document
        const user = new User({
            role,
            profileUrl: imageData.url,
            publicId: imageData.publicId,
            ...data,
        });
        await user.save();

        // Generate token and set cookie
        const token = generateToken({ id: user._id, role: user.role });
        storeToken(res, token, `${user.role}_token`, 7 * 24 * 60 * 60 * 1000);

        // Clear relevant caches
        flushCacheByKey('/api/auth/users');
        flushCacheByKey('/api/dashboard/stats');
        flushCacheByKey('/api/dashboard/new-users');
        flushCacheByKey('/api/auth/profile');

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            _id: user._id,
            token,
        });
    } catch (error) {
        next(error);
    };
};

// **Login**
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne(
            { email },
            { fullName: 1, mobile: 1, email: 1, classId: 1, profileUrl: 1, role: 1 }
        ).populate('classId', 'name')
            .select('+password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({
            success: false,
            status: 401,
            message: 'Invalid credentials'
        });

        const token = generateToken({ id: user._id, role: user.role });
        storeToken(res, token, `${user.role}_token`, 7 * 24 * 60 * 60 * 1000);

        // Convert `classId` object to a key-value pair
        const userData = {
            ...user.toObject(),
            className: user.classId?.name || null, // Extract the name field as className
        };
        delete userData.classId;

        res.status(200).json({
            success: true,
            message: 'User logged in successful...!',
            user: userData,
            token
        });
    } catch (error) {
        next(error);
    };
};

// **Forgot password**
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email }, { email: 1, otp: 1, otpExpires: 1 });

        if (!user) return res.status(404).json({ success: false, status: 404, message: 'User not found.' });

        // Generate OTP and expiration
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Store OTP and its expiration in the user's document
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send the OTP via email or SMS (email in this case)
        await sendOTP(user.email, otp);

        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        next(error);
    }
};

// **Verify reset password otp**
exports.verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne(
            { email, otp, otpExpires: { $gt: Date.now() } },
            { email: 1, otp: 1, otpExpires: 1 }
        );

        if (!user) return res.status(422).json({
            success: false,
            status: 422,
            message: "Invalid or expired OTP."
        });
        // Mark OTP as verified
        user.otpVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: "OTP verified successfully." });
    } catch (error) {
        next(error);
    }
};

// **Reset password**
exports.resetPassword = async (req, res, next) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email }, { createdAt: 0, updatedAt: 0, __v: 0 });
        if (!user) return res.status(404).json({ success: false, status: 404, message: 'User not found.' });

        // Check if OTP verification is completed
        if (!user.otpVerified) {
            return res.status(422).json({
                success: false,
                status: 422,
                message: 'OTP verification is required!',
            });
        };

        // Update the password and clear OTP fields
        user.password = newPassword;
        user.otp = user.otpExpires = null;
        user.otpVerified = false; // Reset verification status
        user.isPasswordReset = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        next(error);
    };
};

// Change Password Controller
exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
        return res.status(422).json({
            success: false,
            status: 422,
            message: 'Old and new passwords are required'
        });
    };

    try {
        // Fetch the user by ID, including password for comparison
        const user = await User.findById(req.user._id).select('+password');;
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found'
            });
        };

        // Validate old password (assuming comparePassword is a method in the User schema)
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(422).json({
                success: false,
                status: 422,
                message: 'Old password is incorrect'
            });
        };

        // Hash the new password and update
        user.password = newPassword;
        user.isPasswordReset = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    };
};

// **Get Profile**
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -createdAt -updatedAt -__v -otpVerified -otp -otpExpires -publicId')
            .populate('classId', 'name'); // Populate `classId` with only `name`

        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' });
        };

        const userData = {
            ...user.toObject(),
            className: user.classId?.name || null, // Extract `name` as `className`
        };
        delete userData.classId; // Remove the original `classId` field

        res.status(200).json({
            success: true,
            message: 'Profile fetched successfully!',
            data: userData,
        });
    } catch (error) {
        next(error);
    };
};

// Update User Profile
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // Validate non-empty updates
        if (!Object.keys(updates).length && (!req.files || !req.files.profileUrl)) {
            return res.status(422).json({ success: false, message: 'No updates provided' });
        };

        // Allowed fields for update
        const allowedUpdates = new Set(['fullName', 'email', 'mobile', 'profileUrl', 'classId']);
        const isUpdateValid = Object.keys(updates).every((key) => allowedUpdates.has(key));

        if (!isUpdateValid) {
            return res.status(422).json({ success: false, status: 422, message: 'Invalid update fields' });
        };

        // Process profile image if provided
        let imageData = { url: null, publicId: null };
        if (req.files?.profileUrl?.tempFilePath) {
            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        };

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...updates,
                    ...(imageData.url && { profileUrl: imageData.url, publicId: imageData.publicId }),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' });
        };

        // Invalidate relevant cache keys
        flushCacheByKey(req.originalUrl);
        flushCacheByKey('/api/auth/users');

        // Respond with success
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    };
};

// **Logout**
exports.logout = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]
            || req.cookies.user_token
            || req.cookies.admin_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'No token provided or invalid format.'
            });
        };

        // Verify the token and clear the respective role-based cookie
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        res.clearCookie(`${decodedToken.role}_token`, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });

        res.status(200).json({ success: true, message: 'User logged out successfully.', token });
    } catch (error) {
        next(error);
    };
};

/**
 * Create a new user
 * @route POST /api/users
 * @access Admin only
 */
exports.createUser = async (req, res, next) => {
    try {
        const { fullName, email, password, mobile, role, classId } = req.body;

        // Check if email is already registered
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.status(422).json({ success: false, message: 'User already registered.' });
        };

        // Handle class validation
        if (role !== 'admin' && !classId) {
            return res.status(422).json({
                success: true,
                message: 'classId is required for non-admin users.'
            });
        };

        let imageData = {};
        if (req.files || Object.keys(req.files).length !== 0) {
            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        };

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password,
            mobile,
            role,
            classId: role === 'admin' ? null : classId,
            profileUrl: imageData.url,
            publicId: imageData.publicId,
        });
        await newUser.save();

        flushCacheByKey('/api/auth/users');
        flushCacheByKey('/api/dashboard/new-users');
        flushCacheByKey('/api/dashboard/stats');

        res.status(201).json({ success: true, message: 'User created successfully.', user: newUser });
    } catch (error) {
        next(error)
    };
};

/**
 * Get all users
 * @route GET /api/users
 * @access Admin only
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find(
            { role: 'user' },
            { updatedAt: 0, __v: 0, otp: 0, otpExpires: 0, otpVerified: 0, publicId: 0 }
        ).populate('classId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            message: "User fetched successfully...!",
            totalUsers: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single user by ID
 * @route GET /api/users/:id
 * @access Admin only
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(
            req.params.userId,
            { createdAt: 0, updatedAt: 0, __v: 0, otp: 0, otpExpires: 0, otpVerified: 0 }
        ).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully...!', user });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a user by ID
 * @route PUT /api/users/:id
 * @access Admin only
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { fullName, email, password, role, className } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        };

        let imageData = {}; // Initialize an empty object to store image data
        if (req.files && Object.keys(req.files).length !== 0) {
            // If a new image is uploaded
            const userData = await User.findById(req.params.userId, { publicId: 1 });
            if (userData && userData.publicId) {
                // If the category already has an image, delete the old one
                await deleteImage(userData.publicId);
            };
            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        } else {
            // If no new image is provided, use the current image data
            const userData = await User.findById(req.params.userId, { profileUrl: 1, publicId: 1 });
            imageData.url = userData.profileUrl;
            imageData.publicId = userData.publicId;
        };

        // Update fields if provided
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (password) user.password = password;
        if (role) user.role = role;
        if (profileUrl) usre.profileUrl = imageData.profileUrl;
        if (publicId) user.publicId = imageData.publicId;
        if (role !== 'admin' && className) {
            user.className = className;
        } else if (role === 'admin') {
            user.className = null;
        };

        flushCacheByKey('/api/auth/users');
        flushCacheByKey(req.originalUrl);

        await user.save();
        res.status(200).json({ success: true, message: 'User updated successfully.', user });
    } catch (error) {
        next(error);
    };
};

/**
 * Delete a user by ID
 * @route DELETE /api/users/:id
 * @access Admin only
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const userData = await User.findById(req.params.userId, { publicId: 1 });
        if (userData && userData.publicId) await deleteImage(userData.publicId);

        const user = await User.findByIdAndDelete(req.params.userId).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        };

        flushCacheByKey('/api/auth/users');
        flushCacheByKey(req.originalUrl);
        flushCacheByKey('/api/dashboard/new-users');

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    };
};
