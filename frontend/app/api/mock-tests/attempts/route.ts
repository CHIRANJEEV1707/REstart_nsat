import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import MockTest from '@/lib/models/MockTest';
import { getUserFromToken } from '@/lib/auth-utils';

// Force model registration for populate
void MockTest;

// GET - Get user's completed test attempts
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

        const attempts = await TestAttempt.find({
            userId,
            status: 'completed'
        })
            .populate('mockTestId', 'title slug examType')
            .select('totalScore maxScore percentage completedAt analytics.percentile analytics.rank')
            .sort({ completedAt: -1 });

        return NextResponse.json({
            success: true,
            data: attempts
        });
    } catch (error: any) {
        console.error('[Attempts Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch attempt history' },
            { status: 500 }
        );
    }
}
