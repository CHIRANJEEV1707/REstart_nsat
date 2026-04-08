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
        const { questionId, selectedAnswer } = body;

        if (!questionId) {
            return NextResponse.json(
                { success: false, message: 'questionId is required' },
                { status: 400 }
            );
        }

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId,
            status: 'in-progress',
        });

        if (!attempt) {
            return NextResponse.json(
                { success: false, message: 'Attempt not found or not in progress' },
                { status: 400 }
            );
        }

        const existingIdx = attempt.answers.findIndex(
            (a) => a.questionId.toString() === questionId
        );

        if (existingIdx >= 0) {
            attempt.answers[existingIdx].selectedAnswer = selectedAnswer ?? '';
        } else {
            attempt.answers.push({
                questionId,
                selectedAnswer: selectedAnswer ?? '',
                isCorrect: false,
                isVerified: false,
                marksAwarded: 0,
                timeSpent: 0,
            });
        }

        await attempt.save();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Save Answer Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to save answer' },
            { status: 500 }
        );
    }
}
