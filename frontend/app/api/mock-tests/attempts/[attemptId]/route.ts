import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import TestAttempt from '@/lib/models/TestAttempt';
import Question from '@/lib/models/Question';
import '@/lib/models/MockTest';

export async function GET(
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

        const attempt = await TestAttempt.findOne({ _id: attemptId, userId })
            .populate('mockTestId', 'title duration totalMarks examType')
            .lean();

        if (!attempt) {
            return NextResponse.json(
                { success: false, message: 'Attempt not found' },
                { status: 404 }
            );
        }

        const mockTestId = (attempt.mockTestId as any)?._id ?? attempt.mockTestId;

        const questions = await Question.find({ mockTestId })
            .select('questionText options correctAnswer explanation marks negativeMarks section questionNumber isCoding questionType')
            .sort({ questionNumber: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                attempt,
                questions,
            },
        });
    } catch (error: any) {
        console.error('[Get Attempt Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch attempt' },
            { status: 500 }
        );
    }
}
