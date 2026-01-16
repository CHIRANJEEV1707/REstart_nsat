import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted,
                profile: user.profile,
                preferences: user.preferences,
                purchasedBundles: user.purchasedBundles
            }
        });
    } catch (error: any) {
        console.error('[Get Profile Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone, address } = body;

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (name) user.name = name;

        // Ensure profile object exists
        if (!user.profile) {
            user.profile = {
                city: '',
                state: '',
                country: '',
                phoneNumber: ''
            };
        }

        if (phone !== undefined) user.profile.phoneNumber = phone;

        if (address) {
            if (address.city !== undefined) user.profile.city = address.city;
            if (address.state !== undefined) user.profile.state = address.state;
            if (address.country !== undefined) user.profile.country = address.country;
        }

        user.markModified('profile');
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error: any) {
        console.error('[Update Profile Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
