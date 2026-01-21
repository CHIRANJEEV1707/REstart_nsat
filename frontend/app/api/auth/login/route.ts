import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

// Helper: Sign Access Token (15 min)
const signAccessToken = (id: string, sessionToken: string) => {
    return jwt.sign({ id, sessionToken }, process.env.JWT_SECRET!, {
        expiresIn: '15m'
    });
};

// Helper: Sign Refresh Token (7 days or 30 days)
const signRefreshToken = (id: string, rememberMe: boolean = false) => {
    const expiresIn = rememberMe ? '30d' : '7d';
    return jwt.sign({ id, rememberMe }, process.env.JWT_SECRET!, {
        expiresIn
    });
};

export async function POST(request: NextRequest) {
    try {
        console.log('[Login] Request received');
        await dbConnect();
        const body = await request.json();

        // Validate input
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password, rememberMe } = parsed.data;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            user.failedLoginAttempts += 1;
            await user.save();
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Success - Reset login attempts
        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
        }

        // Generate and Save Session Token
        const sessionToken = crypto.randomUUID();
        user.sessionToken = sessionToken;
        await user.save();

        console.log('[Login] Session Token generated for:', user.email);

        // Generate tokens
        const accessToken = signAccessToken(user._id.toString(), sessionToken);
        const refreshToken = signRefreshToken(user._id.toString(), rememberMe);

        // Cookie options
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax', // Cast issue otherwise
            path: '/',
        } as const;

        // Create response
        const response = NextResponse.json({
            success: true,
            accessToken,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted
            }
        }, { status: 200 });

        // Set cookies
        response.cookies.set('token', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60, // 15 minutes
        });

        // Refresh token maxAge depends on rememberMe
        const refreshTokenMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 // 30 days
            : 7 * 24 * 60 * 60; // 7 days

        response.cookies.set('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: refreshTokenMaxAge,
        });

        return response;
    } catch (error: any) {
        console.error('[Login Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
