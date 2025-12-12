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
        state: z.string().optional(),
        class_level: z.string().optional(),
        target_exams: z.array(z.string()).optional(),
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
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Helper: Send Token Response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user._id);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const
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
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, state, class_level, target_exams } = req.body;

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
            state,
            class_level,
            target_exams
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
        // @ts-ignore - req.user will be added by auth middleware later
        const user = await User.findById(req.user.id);
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
            class_level: req.body.class_level,
            target_exams: req.body.target_exams
        };

        // @ts-ignore
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
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
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};
