import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// Helper: Sign Access Token (15 min)
const signAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '15m'
    });
};

// Helper: Sign Refresh Token (7 days)
const signRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '7d'
    });
};

export async function POST(request: NextRequest) {
    try {
        console.log('[Login] Request received');
        await dbConnect();
        console.log('[Login] DB Connected');

        const body = await request.json();
        console.log('[Login] Processing login for:', body.email);

        // Validate input
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            console.log('[Login] Validation failed');
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        console.log('[Login] User found:', !!user);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // ... lockout check logs ...

        // Check password
        console.log('[Login] Checking password...');
        const isMatch = await user.matchPassword(password);
        console.log('[Login] Password match result:', isMatch);

        if (!isMatch) {
            console.log('[Login] Password mismatch');
            // ... existing lockout logic ...
            // Increment failed attempts
            user.failedLoginAttempts += 1;
            await user.save();
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('[Login] Success. Generating tokens...');

        // Success - Reset login attempts
        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }

        // Generate tokens
        const accessToken = signAccessToken(user._id.toString());
        const refreshToken = signRefreshToken(user._id.toString());

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

        response.cookies.set('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60, // 7 days
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
