"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    // Debug: Check if cookies are being received at all
    console.log('=== AUTH MIDDLEWARE CALLED ===');
    console.log('req.cookies:', req.cookies);
    console.log('req.headers.cookie:', req.headers.cookie);
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        console.log('[Auth] No token found in cookies');
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            console.log('[Auth] User not found for decoded ID:', decoded.id);
            // Clear invalid cookie
            res.cookie('token', 'none', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true
            });
            return res.status(401).json({ success: false, message: 'Not authorized: User not found' });
        }
        console.log('[Auth] User authenticated:', user.email);
        req.user = user;
        next();
    }
    catch (error) {
        console.log('[Auth] JWT verification failed:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
exports.protect = protect;
