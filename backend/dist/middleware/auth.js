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
    // 1. Check Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check Cookie (Fallback or Primary depending on client)
    else if (req.cookies.token) {
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
            try {
                const decodedRefresh = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
                const user = await User_1.default.findById(decodedRefresh.id);
                if (user) {
                    // Issue new Access Token
                    const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
                        expiresIn: '15m'
                    });
                    // Set new cookie with correct Production settings
                    res.cookie('token', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Fix: 'none' for production
                        path: '/',
                        expires: new Date(Date.now() + 15 * 60 * 1000)
                    });
                    // Add Authorization header to response for client to update local state if needed
                    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                    return setAuthorizedUser(user);
                }
            }
            catch (refreshError) {
                // Squelch refresh error, will return 401 below
            }
        }
        // Neither token worked
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    catch (error) {
        // If the first token verification failed (expired), we should have fallen through to refresh token above?
        // No, verify throws. We need to catch specific TokenExpiredError or handle flow logic manually.
        // Actually, simpler logic:
        // Inside the catch block is where we should try the refresh token if the error was expiration.
        // But to keep it clean, let's just attempt refresh logic if the first check failed OR threw.
        // RE-TRY Refresh Token logic here if it wasn't already tried?
        // Copy-paste logic is bad. 
        // Let's rely on the block structure: 
        // If verify throws, we land here. We should TRY refresh token here.
        if (req.cookies.refreshToken) {
            try {
                const decodedRefresh = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
                const user = await User_1.default.findById(decodedRefresh.id);
                if (user) {
                    const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
                        expiresIn: '15m'
                    });
                    res.cookie('token', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                        path: '/',
                        expires: new Date(Date.now() + 15 * 60 * 1000)
                    });
                    return setAuthorizedUser(user);
                }
            }
            catch (err) {
                // Refresh failed too
            }
        }
        return res.status(401).json({ success: false, message: 'Not authorized: ' + error.message });
    }
};
exports.protect = protect;
