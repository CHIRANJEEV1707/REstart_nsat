import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    verificationToken: z.string().optional()
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
        await dbConnect();

        const body = await request.json();

        // Validate input
        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password, verificationToken } = parsed.data;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists' },
                { status: 400 }
            );
        }

        // Verify the verification token if provided
        let isEmailVerified = false;
        if (verificationToken) {
            try {
                const decoded: any = jwt.verify(verificationToken, process.env.JWT_SECRET || 'secret');
                if (decoded.email?.toLowerCase() === email.toLowerCase() && decoded.verified && decoded.type === 'email-verification') {
                    isEmailVerified = true;
                }
            } catch (err) {
                // Token invalid or expired - continue but don't mark as verified
                console.log('[Signup] Verification token invalid or expired');
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            onboardingCompleted: false,
            onboardingStep: 1,
            isEmailVerified,
            emailVerifiedAt: isEmailVerified ? new Date() : undefined
        });

        // Generate tokens
        const accessToken = signAccessToken(user._id.toString());
        const refreshToken = signRefreshToken(user._id.toString());

        // Cookie options
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
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
                onboardingCompleted: user.onboardingCompleted,
                isEmailVerified: user.isEmailVerified
            }
        }, { status: 201 });

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
        console.error('[Signup Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Signup failed' },
            { status: 500 }
        );
    }
}

