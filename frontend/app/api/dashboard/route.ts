import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import UserExamProgress from '@/lib/models/UserExamProgress';
import TestAttempt from '@/lib/models/TestAttempt';
import '@/lib/models/MockTest';
import SessionBooking from '@/lib/models/SessionBooking';
import Question from '@/lib/models/Question';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Sum totalQuestionsSolved across all exam progress docs for this user
        const progressDocs = await UserExamProgress.find({ user: userId })
            .select('totalQuestionsSolved')
            .lean();
        const totalQuestionsAttempted = progressDocs.reduce(
            (sum, doc) => sum + (doc.totalQuestionsSolved || 0),
            0
        );

        // Last 10 completed mock test attempts, populated with test title
        const attempts = await TestAttempt.find({ userId, status: 'completed' })
            .sort({ completedAt: -1 })
            .limit(10)
            .populate<{ mockTestId: { title: string } }>('mockTestId', 'title')
            .lean();

        const mockScores = attempts.map((attempt) => ({
            testName: (attempt.mockTestId as any)?.title ?? 'Unknown Test',
            score: attempt.totalScore,
            maxScore: attempt.maxScore,
            takenAt: attempt.completedAt,
        }));

        // Next scheduled session for this user
        const nextSessionDoc = await SessionBooking.findOne({
            userId,
            status: 'scheduled',
        })
            .sort({ createdAt: 1 })
            .lean();

        const nextSession = nextSessionDoc
            ? {
                topic: nextSessionDoc.sessionType,
                sessionDate: nextSessionDoc.createdAt,
                whatsappLink: nextSessionDoc.calendlyUrl,
            }
            : null;

        // Deterministic Question of the Day based on today's date
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        const total = await Question.countDocuments({ isCoding: false, questionType: 'mcq' });

        let questionOfTheDay = null;
        if (total > 0) {
            const index = seed % total;
            const qotd = await Question.findOne({ isCoding: false, questionType: 'mcq' })
                .skip(index)
                .select('questionText options correctAnswer explanation difficulty subject section')
                .lean();

            if (qotd) {
                questionOfTheDay = {
                    questionText: qotd.questionText,
                    options: qotd.options,
                    correctAnswer: qotd.correctAnswer,
                    explanation: qotd.explanation,
                    difficulty: qotd.difficulty,
                    subject: qotd.subject ?? null,
                    section: qotd.section,
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                totalQuestionsAttempted,
                mockScores,
                nextSession,
                questionOfTheDay,
            },
        });
    } catch (error: any) {
        console.error('[Dashboard Error]', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
