import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import MockTest from '@/lib/models/MockTest';
import Question from '@/lib/models/Question';
import TestAttempt from '@/lib/models/TestAttempt';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
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

        const { slug } = await params;
        const body = await request.json().catch(() => ({}));
        const cameraEnabled: boolean = body.cameraEnabled ?? false;

        // Find the test
        const test = await MockTest.findOne({ slug, isActive: true }).lean();
        if (!test) {
            return NextResponse.json(
                { success: false, message: 'Test not found' },
                { status: 404 }
            );
        }

        // Check for an existing in-progress attempt
        const existingAttempt = await TestAttempt.findOne({
            userId,
            mockTestId: test._id,
            status: 'in-progress',
        });

        let attempt = existingAttempt;

        if (!attempt) {
            // Create a new attempt
            attempt = await TestAttempt.create({
                userId,
                mockTestId: test._id,
                startedAt: new Date(),
                status: 'in-progress',
                answers: [],
                totalScore: 0,
                maxScore: test.totalMarks,
                percentage: 0,
                totalTimeSpent: 0,
                timeAllowed: test.duration * 60,
                cameraEnabled,
                violations: [],
                totalViolations: 0,
                proctoringSummary: { tabSwitches: 0, fullscreenExits: 0, windowBlurs: 0 },
                analytics: {
                    sectionWise: [],
                    percentile: 0,
                    rank: 0,
                    accuracy: 0,
                    totalParticipants: 0,
                    weakAreas: [],
                    strongAreas: [],
                    recommendations: [],
                },
            });
        }

        // Fetch questions — strip correct answers for client
        const questions = await Question.find({ mockTestId: test._id })
            .select('section questionNumber questionText questionType options marks negativeMarks difficulty isCoding constraints codeTemplate testCases')
            .sort({ questionNumber: 1 })
            .lean();

        // For coding questions, hide hidden test cases from client
        const sanitisedQuestions = questions.map((q) => ({
            ...q,
            testCases: q.testCases?.filter((tc) => !tc.isHidden) ?? [],
        }));

        return NextResponse.json({
            success: true,
            data: {
                attempt,
                questions: sanitisedQuestions,
                test: {
                    _id: test._id,
                    title: test.title,
                    slug: test.slug,
                    duration: test.duration,
                    totalMarks: test.totalMarks,
                    sections: test.sections,
                },
            },
        });
    } catch (error: any) {
        console.error('[Mock Test Start Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to start test' },
            { status: 500 }
        );
    }
}
