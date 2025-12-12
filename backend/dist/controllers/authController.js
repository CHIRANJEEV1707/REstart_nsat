"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = exports.loginSchema = exports.registerSchema = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
// Zod Schemas
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        state: zod_1.z.string().optional(),
        class_level: zod_1.z.string().optional(),
        target_exams: zod_1.z.array(zod_1.z.string()).optional(),
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    })
});
// Helper: Sign JWT
const signToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};
// Helper: Send Token Response
const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id);
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };
    res.status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
// @desc    Register user
// @route   POST /api/auth/signup
const register = async (req, res, next) => {
    try {
        const { name, email, password, state, class_level, target_exams } = req.body;
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
            state,
            class_level,
            target_exams
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
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
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
        // @ts-ignore - req.user will be added by auth middleware later
        const user = await User_1.default.findById(req.user.id);
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
