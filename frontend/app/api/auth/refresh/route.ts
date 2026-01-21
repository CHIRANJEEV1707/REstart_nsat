import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Helper: Sign Access Token (15 min)
const signAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '15m'
    });
};

// Helper: Sign Refresh Token
const signRefreshToken = (id: string, rememberMe: boolean = false) => {
    const expiresIn = rememberMe ? '30d' : '7d';
    return jwt.sign({ id, rememberMe }, process.env.JWT_SECRET!, {
        expiresIn
    });
};

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'No refresh token found' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string, rememberMe?: boolean };
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 401 }
            );
        }

        // Persist rememberMe state
        const rememberMe = !!decoded.rememberMe;

        // Generate tokens
        const accessToken = signAccessToken(user._id.toString());
        const newRefreshToken = signRefreshToken(user._id.toString(), rememberMe);

        // Cookie options
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax', // Cast issue otherwise
            path: '/',
        } as const;

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
        });

        // Set cookies
        response.cookies.set('token', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60, // 15 minutes
        });

        // Persist expiration logic
        const refreshTokenMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 // 30 days
            : 7 * 24 * 60 * 60; // 7 days

        response.cookies.set('refreshToken', newRefreshToken, {
            ...cookieOptions,
            maxAge: refreshTokenMaxAge,
        });

        return response;

    } catch (error: any) {
        console.error('[Refresh Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Refresh failed' },
            { status: 500 }
        );
    }
}
