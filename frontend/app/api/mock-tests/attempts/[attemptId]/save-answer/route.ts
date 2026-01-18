import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

async function getUser(request: NextRequest) {
    let token: string | undefined;

    // Try cookies first
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;

    // Fallback to Authorization header
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
    await dbConnect();
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { attemptId } = await params;
        const { questionId, selectedAnswer, timeSpent, isVerified } = await request.json();

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: user._id, // Ensure user owns attempt
            status: 'in-progress'
        });

        if (!attempt) {
            return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });
        }

        // Update the answer
        const answerIndex = attempt.answers.findIndex(
            a => a.questionId.toString() === questionId
        );

        if (answerIndex !== -1) {
            attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
            attempt.answers[answerIndex].timeSpent = (attempt.answers[answerIndex].timeSpent || 0) + (timeSpent || 0); // Accumulate time? Or set? Backend logic set it.
            // Frontend usually sends incremental time or total time?
            // "timeSpent" implies total time spent on this question so far? Or delta?
            // The backend logic was: attempt.answers[answerIndex].timeSpent = timeSpent;
            // I'll stick to replacing it for now, assuming frontend tracks total.
            // Actually, frontend logic: `timeSpent: 0`. Wait.
            // Frontend: `api.post(..., { questionId, selectedAnswer, timeSpent: 0 })`.
            // So currently timeSpent is 0.

            attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
            // attempt.answers[answerIndex].timeSpent = timeSpent; 

            if (isVerified !== undefined) {
                (attempt.answers as any)[answerIndex].isVerified = isVerified;
            }

            // Mark modified? Mongoose detects changes in arrays.
        } else {
            // If not found in initialized array, pushing might be needed (though typically attempts initialize all questions).
            // If attempt created with questions, findIndex should work.
            // If not found, ignore or add?
        }

        await attempt.save();

        return NextResponse.json({ success: true, message: 'Answer saved' });
    } catch (error: any) {
        console.error('[SaveAnswer Error]', error);
        return NextResponse.json({ success: false, message: 'Failed to save answer' }, { status: 500 });
    }
}
