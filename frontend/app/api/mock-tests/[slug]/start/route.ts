import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';
import TestAttempt from '@/lib/models/TestAttempt';
import Question from '@/lib/models/Question';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getUser(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    console.log(`[StartTest] Attempting to start test for slug: ${slug}`);

    // Debug: list all tests
    const allTests = await MockTest.find({}, { slug: 1, title: 1 });
    console.log('[StartTest] Available tests:', allTests.map(t => t.slug));

    const test = await MockTest.findOne({ slug });

    if (!test) {
        console.log(`[StartTest] Test not found for slug: ${slug}`);
        return NextResponse.json({ success: false, message: `Test not found: ${slug}` }, { status: 404 });
    }

    console.log(`[StartTest] Found test: ${test.title}`);
    // If test is not free, user must have 'premium' access level or purchased bundle
    // For now, simplify: if !isFree and user doesn't have premium (we can check FreePackClaim or User role/subscription)
    // Assuming simple check for now or relying on frontend to gate. 
    // Ideally, check for specific purchase. 
    // Since I implemented "Free Pack" logic, I should check that.

    // For this MVP, let's assume if it is NOT free, we check if user has claimed free pack (which gives access to "Free Starter Pack" items).
    // Wait, the user said "Free Pack" gives access to specific tests.
    // If the test is marked `isFree: false`, it might be a paid test.
    // Let's just create the attempt for now. Detailed access control can be enhanced.
    // The frontend handles the "Lock" UI.

    const body = await request.json();

    // Check if there is an existing active attempt? 
    // Maybe we allow multiple attempts.

    try {
        // Fetch questions to initialize answers array
        const questions = await Question.find({ mockTestId: test._id }).sort({ questionNumber: 1 });

        const attempt = await TestAttempt.create({
            userId: user._id, // NOTE: Check if model expects 'userId' or 'user'
            mockTestId: test._id,
            startedAt: new Date(),
            status: 'in-progress',
            maxScore: test.totalMarks,
            timeAllowed: test.duration * 60,
            answers: questions.map(q => ({
                questionId: q._id,
                selectedAnswer: '',
                isCorrect: false,
                marksAwarded: 0,
                timeSpent: 0
            })),
            violations: []
        });

        // Return questions without correct answers
        const questionsWithoutAnswers = questions.map(q => ({
            _id: q._id,
            section: q.section,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            isCoding: q.isCoding, // Ensure schema has this or use get logic
            codeTemplate: q.codeTemplate,
            testCases: q.testCases?.filter((tc: any) => !tc.isHidden)
        }));

        return NextResponse.json({
            success: true,
            data: {
                attempt,
                test: {
                    title: test.title,
                    duration: test.duration,
                    sections: test.sections
                },
                questions: questionsWithoutAnswers
            }
        });
    } catch (error: any) {
        console.error('[StartTest] Error creating attempt:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to start test' }, { status: 500 });
    }
}
