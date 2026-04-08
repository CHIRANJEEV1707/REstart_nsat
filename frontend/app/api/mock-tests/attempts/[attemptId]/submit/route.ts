import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import TestAttempt from '@/lib/models/TestAttempt';
import Question from '@/lib/models/Question';

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

        const attempt = await TestAttempt.findOne({ _id: attemptId, userId });

        if (!attempt) {
            return NextResponse.json(
                { success: false, message: 'Attempt not found' },
                { status: 404 }
            );
        }

        if (attempt.status === 'completed') {
            return NextResponse.json(
                { success: false, message: 'Attempt already submitted' },
                { status: 400 }
            );
        }

        // Fetch all questions for this test with scoring info
        const questions = await Question.find({ mockTestId: attempt.mockTestId })
            .select('_id correctAnswer marks negativeMarks')
            .lean();

        const questionMap = new Map(
            questions.map((q) => [q._id.toString(), q])
        );

        let totalScore = 0;

        for (const answer of attempt.answers) {
            const question = questionMap.get(answer.questionId.toString());
            if (!question) continue;

            const selected = (answer.selectedAnswer ?? '').trim().toLowerCase();
            const correct = (question.correctAnswer ?? '').trim().toLowerCase();

            if (!selected) {
                answer.isCorrect = false;
                answer.marksAwarded = 0;
            } else if (selected === correct) {
                answer.isCorrect = true;
                answer.marksAwarded = question.marks ?? 0;
                totalScore += answer.marksAwarded;
            } else {
                answer.isCorrect = false;
                answer.marksAwarded = -(question.negativeMarks ?? 0);
                totalScore += answer.marksAwarded;
            }
        }

        const maxScore = attempt.maxScore || 0;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100 * 100) / 100 : 0;

        attempt.status = 'completed';
        attempt.totalScore = totalScore;
        attempt.percentage = percentage;
        attempt.completedAt = new Date();

        await attempt.save();

        return NextResponse.json({
            success: true,
            data: {
                attemptId: attempt._id,
                score: totalScore,
                totalMarks: maxScore,
                percentage,
            },
        });
    } catch (error: any) {
        console.error('[Submit Attempt Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit attempt' },
            { status: 500 }
        );
    }
}
