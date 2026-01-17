import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import MockTest from '@/lib/models/MockTest';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
    try {
        await dbConnect();

        const userId = await getCurrentUser(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { attemptId } = await params;
        const attempt = await TestAttempt.findById(attemptId)
            .populate('mockTestId', 'title totalMarks sections duration')
            .lean();

        if (!attempt) {
            return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });
        }

        // Use toString safely as attempt is lean()
        const attemptUserId = (attempt.userId as any).toString(); // cast to any to be safe if lean type missing
        if (attemptUserId !== userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        // Return full analytics
        // In a real scenario we might filter based on premium status here too if we want to gate detailed analytics

        return NextResponse.json({
            success: true,
            data: attempt
        });
    } catch (error: any) {
        console.error('[Attempt Details Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch attempt details' },
            { status: 500 }
        );
    }
}
