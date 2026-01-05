import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // 1. Check Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith('bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check Cookie (Fallback or Primary depending on client)
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Common function to handle user capabilities
    const setAuthorizedUser = (user: any) => {
        req.user = user;
        next();
    };

    try {
        // DEBUG: Log tokens received
        console.log(`[Auth] Header: ${req.headers.authorization ? 'Present' : 'Missing'}, Cookie: ${req.cookies.token ? 'Present' : 'Missing'}`);
        if (token) console.log(`[Auth] Token used: ${token.substring(0, 10)}...`);

        if (token) {
            // Try to verify Access Token
            try {
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                const user = await User.findById(decoded.id);
                if (user) {
                    return setAuthorizedUser(user);
                } else {
                    console.log('[Auth] Token Valid but User Not Found in DB');
                }
            } catch (e: any) {
                console.log(`[Auth] Token Verify Failed: ${e.message}`);
            }
        } else {
            console.log('[Auth] No Header Token found');
        }

        // If Access Token is invalid/missing, try Refresh Token
        if (req.cookies.refreshToken) {
            console.log('[Auth] Attempting Refresh Token...');
            try {
                const decodedRefresh: any = jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
                const user = await User.findById(decodedRefresh.id);

                if (user) {
                    // Issue new Access Token
                    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
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
            } catch (refreshError) {
                console.log('[Auth] Refresh Token Failed');
            }
        } else {
            console.log('[Auth] No Refresh Token Cookie found');
        }

        // Neither token worked
        console.log('[Auth] Returning 401 - Final Fallback');
        return res.status(401).json({ success: false, message: 'Not authorized' });

    } catch (error: any) {
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
                const decodedRefresh: any = jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET || 'secret');
                const user = await User.findById(decodedRefresh.id);

                if (user) {
                    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
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
            } catch (err) {
                // Refresh failed too
            }
        }

        return res.status(401).json({ success: false, message: 'Not authorized: ' + error.message });
    }
};
