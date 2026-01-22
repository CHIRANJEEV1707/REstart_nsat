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

    // Flag to indicate if we should try refresh token
    let tryRefresh = false;

    // Step 1: Verify Access Token if present
    if (token) {
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await User.findById(decoded.id);
            if (user) {
                return setAuthorizedUser(user);
            } else {
                console.log('[Auth] Token Valid but User Not Found in DB');
                tryRefresh = true; // User might have been deleted, but technically token was valid signature.
                // Actually if user not found, refresh won't help unless db id changed?
                // But let's fall through to be safe.
            }
        } catch (e: any) {
            console.log(`[Auth] Access Token Verify Failed: ${e.message}`);
            tryRefresh = true;
        }
    } else {
        console.log('[Auth] No Access Token found');
        tryRefresh = true;
    }

    // Step 2: Try Refresh Token if needed
    if (tryRefresh && req.cookies.refreshToken) {
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
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/',
                    expires: new Date(Date.now() + 15 * 60 * 1000)
                });

                // Add Authorization header to response for client to update local state if needed
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);

                return setAuthorizedUser(user);
            } else {
                console.log('[Auth] Refresh Token User Not Found');
            }
        } catch (refreshError: any) {
            console.log(`[Auth] Refresh Token Verify Failed: ${refreshError.message}`);
        }
    } else if (tryRefresh) {
        console.log('[Auth] No Refresh Token Cookie found to fallback on');
    }

    // Neither token worked
    console.log('[Auth] Returning 401 - Not authorized');
    return res.status(401).json({ success: false, message: 'Not authorized' });
};

// Admin middleware - must be used after 'protect'
export const admin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access required' });
    }
};
