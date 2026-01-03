"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateDetails = exports.logout = exports.getMe = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
// Zod Schemas
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    })
});
// Helper: Sign Access Token (15 min)
const signAccessToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
};
// Helper: Sign Refresh Token (7 days)
const signRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};
// Helper: Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    // Common Cookie Options
    const commonOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
        path: '/',
    };
    res.status(statusCode)
        .cookie('token', accessToken, {
        ...commonOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    })
        .cookie('refreshToken', refreshToken, {
        ...commonOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
        .json({
        success: true,
        accessToken, // Optional: send back if frontend needs to store in memory (though cookies handled it)
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted
        }
    });
};
// @desc    Register user
// @route   POST /api/auth/signup
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user exists
        let user = await User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }
        // Create user
        user = await User_1.default.create({
            name,
            email,
            password,
            onboardingCompleted: false, // Explicitly set to false
            onboardingStep: 1 // Signup completed
        });
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check for user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // Check Lockout
        if (user.lockUntil && user.lockUntil > new Date()) {
            res.status(429).json({
                success: false,
                message: 'Account locked due to multiple failed login attempts. Please try again later.'
            });
            return;
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            // Increment Failed Attempts
            user.failedLoginAttempts += 1;
            // Lock if >= 5
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
                user.failedLoginAttempts = 0; // Reset counter after locking? Or keep it? keeping it ensures subsequent fails extend? 
                // Standard: limit reached -> lock. Reset attempts is optional but clean. 
                // Let's reset attempts only on successful login, 
                // but here since we locked, we can leave it or reset. 
                // Resetting it allows clean slate after 15 mins.
            }
            await user.save();
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // Success - Reset Login Attempts
        if (user.failedLoginAttempts > 0 || user.lockUntil) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
// @desc    Logout
// @route   POST /api/auth/logout
const logout = (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
const updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            state: req.body.state,
            city: req.body.city,
            country: req.body.country,
            class_level: req.body.class_level,
            target_degree: req.body.target_degree,
            college_type_aspiring: req.body.college_type_aspiring,
            preferred_countries: req.body.preferred_countries,
            // Map Map new inputs to legacy fields (and schema will handle sync if we add pre-save, but here we are doing explicit update)
            target_exams: req.body.target_exams || req.body.interestedExams,
            exam_scores: req.body.exam_scores,
            budget_range: req.body.budget_range || req.body.budgetINR || req.body.budgetUSD,
            // Also update preferences struct types
            'preferences.budgetUSD': req.body.budgetUSD,
            'preferences.budgetINR': req.body.budgetINR,
            'preferences.interestedExams': req.body.interestedExams || req.body.target_exams
        };
        const user = await User_1.default.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDetails = updateDetails;
// @desc    Update password
// @route   PUT /api/auth/updatepassword
// Note: For enhanced security, consider implementing email confirmation for password changes
// This would prevent attackers from changing passwords even if they compromise a session
const updatePassword = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Verify current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }
        // Update password
        user.password = req.body.newPassword;
        await user.save();
        // Send new token (logs out other sessions)
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePassword = updatePassword;
