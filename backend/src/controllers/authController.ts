import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Zod Schemas
export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    })
});

// Helper: Sign JWT
const signToken = (id: string) => {
    // JWT_SECRET is validated at server startup, so it's guaranteed to exist here
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '7d'
    });
};

// Helper: Send Token Response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user._id);

    // Secure cookie configuration
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true, // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax', // 'lax' for dev (cross-origin), 'strict' for production
        path: '/', // Make cookie available for all paths
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
                role: user.role,
                onboardingCompleted: user.onboardingCompleted
            }
        });
};

// @desc    Register user
// @route   POST /api/auth/signup
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }

        // Create user
        user = await User.create({
            name,
            email,
            password,
            onboardingCompleted: false, // Explicitly set to false
            onboardingStep: 1 // Signup completed
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
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
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user?._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
export const updateDetails = async (req: Request, res: Response, next: NextFunction) => {
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

        const user = await User.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// Note: For enhanced security, consider implementing email confirmation for password changes
// This would prevent attackers from changing passwords even if they compromise a session
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user?._id).select('+password');

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
    } catch (error) {
        next(error);
    }
};
