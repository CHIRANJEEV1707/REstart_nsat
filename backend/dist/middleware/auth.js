"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }
    // Common function to handle user capabilities
    const setAuthorizedUser = (user) => {
        req.user = user;
        next();
    };
    try {
        if (token) {
            // Try to verify Access Token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await User_1.default.findById(decoded.id);
            if (user) {
                return setAuthorizedUser(user);
            }
        }
        // If Access Token is invalid/missing, try Refresh Token
        if (req.cookies.refreshToken) {
            const decodedRefresh = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
            const user = await User_1.default.findById(decodedRefresh.id);
            if (user) {
                // Issue new Access Token
                const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
                    expiresIn: '15m'
                });
                // Set new cookie
                res.cookie('token', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
                    path: '/',
                    expires: new Date(Date.now() + 15 * 60 * 1000)
                });
                return setAuthorizedUser(user);
            }
        }
        // Neither token worked
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    catch (error) {
        // If error is just token expiration, the logic above (try-catch block nesting) handles it? 
        // No, jwt.verify throws. So "try" block exits.
        // We need to catch "TokenExpiredError" for access token and try refresh token explicitly inside catch?
        // Or cleaner: Verify Access. If fails, check Refresh.
        // Let's refactor the try-catch to be more robust for the dual-token flow
        // 1. Check Refresh Token (Fallback)
        if (req.cookies.refreshToken) {
            try {
                const decodedRefresh = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
                const user = await User_1.default.findById(decodedRefresh.id);
                if (user) {
                    // Issue new Access Token
                    const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
                        expiresIn: '15m'
                    });
                    res.cookie('token', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
                        path: '/',
                        expires: new Date(Date.now() + 15 * 60 * 1000)
                    });
                    return setAuthorizedUser(user);
                }
            }
            catch (refreshErr) {
                // Refresh token also invalid -> 401
                return res.status(401).json({ success: false, message: 'Not authorized: Session expired' });
            }
        }
        console.log('[Auth] Verification failed:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
exports.protect = protect;
