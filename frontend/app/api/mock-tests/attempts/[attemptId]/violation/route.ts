import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import TestAttempt from '@/lib/models/TestAttempt';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { attemptId } = await params;
        const body = await request.json().catch(() => ({}));
        const { type } = body;

        const attempt = await TestAttempt.findOne({ _id: attemptId, userId });

        if (!attempt) {
            return NextResponse.json(
                { success: false, message: 'Attempt not found' },
                { status: 404 }
            );
        }

        if (Array.isArray(attempt.violations)) {
            attempt.violations.push({ type: type ?? 'unknown', timestamp: new Date() });
            attempt.totalViolations = attempt.violations.length;
            await attempt.save();
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Violation Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to record violation' },
            { status: 500 }
        );
    }
}
