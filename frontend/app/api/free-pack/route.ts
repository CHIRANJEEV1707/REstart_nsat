import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FreePackClaim from '@/lib/models/FreePackClaim';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to get current user from token
async function getCurrentUser(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getCurrentUser(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Please login to claim free pack' },
                { status: 401 }
            );
        }

        // Check if already claimed
        const existingClaim = await FreePackClaim.findOne({ userId });
        if (existingClaim) {
            return NextResponse.json({
                success: true,
                message: 'Free pack already claimed',
                data: existingClaim,
                alreadyClaimed: true
            });
        }

        const body = await request.json().catch(() => ({}));

        // Get user email from User model
        const User = (await import('@/lib/models/User')).default;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Create claim
        const claim = await FreePackClaim.create({
            userId,
            email: user.email,
            phone: body.phone,
            source: body.source || 'direct'
        });

        return NextResponse.json({
            success: true,
            message: 'Free pack claimed successfully!',
            data: claim
        }, { status: 201 });
    } catch (error: any) {
        console.error('[Free Pack Claim Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to claim free pack' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getCurrentUser(request);
        if (!userId) {
            return NextResponse.json({
                success: true,
                data: { hasFreepack: false, isPremium: false, accessLevel: 'none' }
            });
        }

        const claim = await FreePackClaim.findOne({ userId });

        // Check premium status
        const User = (await import('@/lib/models/User')).default;
        const user = await User.findById(userId);
        const isPremium = (user?.purchasedBundles?.length ?? 0) > 0;

        return NextResponse.json({
            success: true,
            data: {
                hasFreepack: !!claim,
                claimedAt: claim?.claimedAt,
                isPremium,
                accessLevel: isPremium ? 'premium' : (claim ? 'free' : 'none')
            }
        });
    } catch (error: any) {
        console.error('[Free Pack Status Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to check status' },
            { status: 500 }
        );
    }
}
