const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken, storeToken } = require('../utils/token');
const { generateOTP, generateRandomPhoneNumber } = require('../utils/otp');
const { sendOTP, sendWelcomeMessage } = require('../services/emailService');
const { uploadImage, deleteImage } = require('../utils/image');
const { flushAllCache, flushCacheByKey } = require('../middlewares/cacheMiddle');

//**Register**
exports.register = async (req, res, next) => {
    const { role = 'user', ...data } = req.body;

    try {
        // Initialize imageData with default values
        let imageData = { url: null, publicId: null };

        // Validate and process the uploaded file if it exists
        if (req.files && req.files.profileUrl && req.files.profileUrl.tempFilePath) {
            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        };

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
        flushAllCache();

        // send welcome message viva email to user
        await sendWelcomeMessage(user.email, user.fullName);

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Registered successful...!',
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
        )
            .populate('classId', 'name')
            .select('+password');

        if (!user) return res.status(404).json({ success: false, status: 404, message: 'User not found' });

        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({
            success: false,
            status: 401,
            message: 'Invalid email or password !'
        });

        const token = generateToken({ id: user._id, role: user.role });
        storeToken(res, token, `${user.role}_token`, 7 * 24 * 60 * 60 * 1000);

        // Convert `classId` object to a key-value pair
        const userData = {
            ...user.toObject(),
            className: user.classId?.name || null, // Extract the name field as className
        };
        delete userData.classId;
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Logged in successful...!',
            user: userData,
            token
        });
    } catch (error) {
        next(error);
    };
};

// **Get token**
exports.getToken = (req, res, next) => {
    try {
        const token = req.cookies.admin_token; // Get token from cookies

        if (!token) {
            return res.status(401).json({ success: false, message: "No token found" });
        };

        res.status(200).json({ success: true, message: 'Token fetched successfully...!', token });
    } catch (error) {
        next(error);
    };
};

// **Login with Google**
exports.loginWithGoogle = async (req, res, next) => {
    const { name, email } = req.body;

    try {
        let user = await User.findOne(
            { email },
            { otp: 0, otpExpires: 0, otpVerified: 0, createdAt: 0, updatedAt: 0, __v: 0, publicId: 0 }
        ).populate('classId', 'name');

        if (!user) {
            user = new User({
                fullName: name,
                email,
                mobile: await generateRandomPhoneNumber(),
            });
            await user.save();
            flushAllCache();
        };

        const token = generateToken({ id: user._id, role: user.role });
        storeToken(res, token, `${user.role}_token`, 7 * 24 * 60 * 60 * 1000);

        // Convert Mongoose document to plain object
        const userData = user.toObject();
        userData.className = user.classId?.name || null;  // Extract the name field as className
        delete userData.classId;
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Logged in successful...!',
            user: userData,
            token,
        });
    } catch (error) {
        next(error);
    };
};

// **Admin Login**
exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find the admin by email
        const admin = await User.findOne(
            { email, role: 'admin' }, // Ensure it's an admin role
            { fullName: 1, mobile: 1, email: 1, profileUrl: 1, role: 1 }
        ).select('+password'); // Include password for comparison

        if (!admin) {
            return res.status(404).json({ success: false, status: 404, message: 'Admin not found' });
        };

        // Check if the password matches
        const isMatch = await admin.comparePassword(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid email or password !',
            });
        };

        // Generate a token
        const token = generateToken({ id: admin._id, role: admin.role });
        storeToken(res, token, `${admin.role}_token`, 7 * 24 * 60 * 60 * 1000);

        // Prepare admin data for response
        const adminData = admin.toObject();
        delete adminData.password; // Remove the password from the response

        res.status(200).json({
            success: true,
            message: 'Logged in successful...!',
            admin: adminData,
            token,
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
    };
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
    };
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
        const user = await User.findById(req.user._id).select('+password');
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
            message: 'Password updated successfully...!'
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
        const userId = req.params.userId;
        const updates = req.body;

        // Initialize updateData with existing user profileUrl and publicId
        const user = await User.findById(userId).select('profileUrl publicId');
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' });
        };

        let updateData = {
            ...updates,
            profileUrl: user.profileUrl,
            publicId: user.publicId,
        };

        // Process profile image if provided
        if (req.files?.profileUrl?.tempFilePath) {
            const imageData = await uploadImage(
                req.files.profileUrl.tempFilePath,
                'CysProfilesImg',
                220,
                200
            );
            updateData.profileUrl = imageData.url;
            updateData.publicId = imageData.publicId;
        };

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .select('-password -createdAt -updatedAt -__v -otpVerified -otp -otpExpires -publicId')
            .populate('classId', 'name')

        if (!updatedUser) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found' });
        };

        const updated_user = {
            ...updatedUser.toObject(),
            className: updatedUser.classId?.name || null
        };
        delete updated_user.classId;

        // Invalidate relevant cache keys
        flushAllCache()

        // Respond with success
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updated_user,
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

// Fetch all admins
exports.getAdmins = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated data
        const admins = await User.find(
            { role: "admin" },
            {
                updatedAt: 0,
                __v: 0,
                otp: 0,
                otpExpires: 0,
                otpVerified: 0,
                publicId: 0,
                role: 0,
                mobile: 0
            }
        )
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();

        // Get the total count of admins
        const totalAdmins = await User.countDocuments({ role: "admin" });

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No admins found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Admins fetched successfully...!",
            totalAdmins,
            totalPages: Math.ceil(totalAdmins / pageSize),
            currentPage: pageNumber,
            data: admins,
        });
    } catch (error) {
        next(error);
    };
};

// Fetch admin by ID
exports.getAdminById = async (req, res, next) => {
    try {
        const adminId = req.params.adminId;

        // Fetch admin by ID
        const admin = await User.findOne(
            { _id: adminId, role: "admin" },
            {
                updatedAt: 0,
                createdAt: 0,
                __v: 0,
                otp: 0,
                otpExpires: 0,
                otpVerified: 0,
                publicId: 0,
            }
        ).lean();

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        };

        res.status(200).json({
            success: true,
            message: "Admin fetched successfully...!",
            data: admin,
        });
    } catch (error) {
        next(error);
    };
};

// Delete an admin
exports.deleteAdmin = async (req, res, next) => {
    try {
        // Find the admin by ID and role, and get the profile image publicId
        const admin = await User.findOneAndDelete(
            { _id: req.params.adminId, role: "admin" },
            { projection: { publicId: 1 } } // Fetch only the needed field
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found or invalid role",
            });
        };

        // Delete the profile image if publicId exists
        if (admin.publicId) await deleteImage(admin.publicId);

        // Flush the cache
        flushAllCache()

        res.status(200).json({ success: true, message: "Admin deleted successfully...!" });
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

        let imageData = { url: null, publicId: null };
        if (req.files && req.files.profileUrl) {
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

        flushAllCache()

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
// Fetch all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        // Convert page and limit to integers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Fetch paginated users
        const users = await User.find(
            { role: 'user' },
            {
                updatedAt: 0,
                __v: 0, otp: 0,
                otpExpires: 0,
                otpVerified: 0,
                publicId: 0,
                classId: 0,
                mobile: 0,
                role: 0
            }
        )
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip((pageNumber - 1) * pageSize) // Skip for pagination
            .limit(pageSize) // Limit the number of results
            .lean();

        // Get the total count of users with the role 'user'
        const totalUsers = await User.countDocuments({ role: 'user' });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully...!",
            totalUsers,
            totalPages: Math.ceil(totalUsers / pageSize),
            currentPage: pageNumber,
            data: users,
        });
    } catch (error) {
        next(error);
    };
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
            {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                otp: 0,
                otpExpires: 0,
                otpVerified: 0,
                publicId: 0,
                status: 0
            }
        )
            .populate('classId', 'name')
            .lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully...!', data: user });
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
        const { fullName, email, role, classId } = req.body;

        // Fetch the user by ID
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found.' });
        };

        // Default to the existing role if no new role is provided
        let updatedRole = user.role;

        // If a new role is provided, check if it's a valid ObjectId and update it
        if (role && mongoose.Types.ObjectId.isValid(role)) {
            const roleUser = await User.findById(role).select('role'); // Fetch the role from the user collection
            if (roleUser) {
                updatedRole = roleUser.role; // Set the updated role from the user object
            } else {
                return res.status(400).json({ success: false, status: 400, message: 'Invalid role user ID.' });
            };
        };

        // Handle profile image update (upload or keep existing)
        let imageData = {};
        if (req.files && req.files.profileUrl) {
            const userData = await User.findById(req.params.userId, { publicId: 1 });
            if (userData?.publicId) await deleteImage(userData.publicId);

            imageData = await uploadImage(req.files.profileUrl.tempFilePath, 'CysProfilesImg', 220, 200);
        } else {
            const { profileUrl: existingProfileUrl, publicId }
                = await User.findById(req.params.userId, { profileUrl: 1, publicId: 1 });
            imageData.url = existingProfileUrl;
            imageData.publicId = publicId;
        };

        // Update the user fields with the provided or existing values
        Object.assign(user, {
            fullName: fullName || user.fullName,
            email: email || user.email,
            role: updatedRole, // Set the role after looking it up
            classId: role === 'admin' ? null : classId || user.classId,
            profileUrl: imageData.url,
            publicId: imageData.publicId
        });

        // Clear cache and save updated user
        flushAllCache()

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
        flushAllCache();
        flushCacheByKey('api/dashboard/new-users');

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    };
};
