import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import Question from '@/lib/models/Question';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
    await dbConnect();
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { attemptId } = await params;
        console.log(`[Submit] Processing submission for attempt: ${attemptId}`);

        const { answers, totalTimeSpent } = await request.json();

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            console.log('[Submit] Attempt not found or invalid status');
            return NextResponse.json({ success: false, message: 'Attempt not found or already submitted' }, { status: 404 });
        }

        // Get questions with correct answers
        const questions = await Question.find({ mockTestId: attempt.mockTestId });
        console.log(`[Submit] Found ${questions.length} questions for scoring`);
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        // Calculate scores
        let totalScore = 0;
        const sectionScores: any = {};

        // Use submitted answers or callback to existing stored answers if not provided?
        // Frontend sends full 'answers' array on submit.
        const answersToProcess = answers || attempt.answers;
        console.log(`[Submit] Processing ${answersToProcess.length} answers`);

        for (const ans of answersToProcess) {
            const qIdStr = ans.questionId.toString();
            const question = questionMap.get(qIdStr);
            if (!question) {
                console.warn(`[Submit] Question not found for ID: ${qIdStr}`);
                continue;
            }

            // Initialize section
            if (!sectionScores[question.section]) {
                sectionScores[question.section] = {
                    section: question.section,
                    score: 0, maxScore: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0
                };
            }
            sectionScores[question.section].maxScore += question.marks;

            // Find index in attempt.answers to update
            let answerIndex = attempt.answers.findIndex(
                a => a.questionId.toString() === qIdStr
            );

            // Logic for scoring
            let isCorrect = false;
            let marksAwarded = 0;
            const selectedAnswer = ans.selectedAnswer;

            if (!selectedAnswer || selectedAnswer === '') {
                sectionScores[question.section].unattempted += 1;
            } else if (selectedAnswer === question.correctAnswer) {
                isCorrect = true;
                marksAwarded = question.marks;
                totalScore += question.marks;
                sectionScores[question.section].score += question.marks;
                sectionScores[question.section].correct += 1;
            } else {
                marksAwarded = -question.negativeMarks;
                totalScore -= question.negativeMarks;
                sectionScores[question.section].score -= question.negativeMarks;
                sectionScores[question.section].incorrect += 1;
            }

            // Update attempt.answers
            if (answerIndex !== -1) {
                attempt.answers[answerIndex].isCorrect = isCorrect;
                attempt.answers[answerIndex].marksAwarded = marksAwarded;
                attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
                // attempt.answers[answerIndex].timeSpent = ans.timeSpent; // Optional update
            }
        }

        console.log('[Submit] Scoring complete. Total Score:', totalScore);

        // Mock Analytics (Percentile/Rank) - simplified for now
        const rank = 1;
        const percentile = 99; // Placeholder until we have more data

        const sectionAnalytics = Object.values(sectionScores).map((s: any) => ({
            ...s,
            accuracy: s.correct / (s.correct + s.incorrect + s.unattempted) * 100 || 0
        }));

        const weakAreas = sectionAnalytics.filter((s: any) => s.accuracy < 50).map((s: any) => s.section);
        const strongAreas = sectionAnalytics.filter((s: any) => s.accuracy >= 70).map((s: any) => s.section);

        // Ensure maxScore is set
        if (!attempt.maxScore || attempt.maxScore === 0) {
            // Fetch test to get total marks
            const MockTest = require('@/lib/models/MockTest').default; // Dynamic import to avoid circular dep if any
            const test = await MockTest.findById(attempt.mockTestId);
            if (test) {
                attempt.maxScore = test.totalMarks;
            } else {
                // Fallback: sum of question marks?
                attempt.maxScore = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.maxScore, 0);
            }
        }

        // Update attempt
        attempt.status = 'completed';
        attempt.completedAt = new Date();
        attempt.totalScore = Math.max(0, totalScore);

        // Safe percentage calculation
        const maxScore = attempt.maxScore || 1; // Avoid divide by zero
        attempt.percentage = (Math.max(0, totalScore) / maxScore) * 100;

        attempt.totalTimeSpent = totalTimeSpent || 0;

        // Calculate Overall Accuracy
        const totalCorrect = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.correct, 0);
        const totalQuestionsCount = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.correct + s.incorrect + s.unattempted, 0);
        const overallAccuracy = totalQuestionsCount > 0 ? (totalCorrect / totalQuestionsCount) * 100 : 0;

        attempt.analytics = {
            sectionWise: sectionAnalytics,
            accuracy: Math.round(overallAccuracy),
            percentile,
            rank,
            totalParticipants: 1,
            weakAreas,
            strongAreas,
            recommendations: weakAreas.length > 0 ? [`Focus on ${weakAreas.join(', ')}`] : ['Great job!']
        };

        console.log('[Submit] Saving attempt...');
        attempt.markModified('answers'); // Explicitly mark answers as modified to ensure updates are persisted
        attempt.markModified('analytics');

        await attempt.save();
        console.log('[Submit] Attempt saved successfully');

        return NextResponse.json({
            success: true,
            data: {
                totalScore: attempt.totalScore,
                maxScore: attempt.maxScore,
                percentage: attempt.percentage,
                analytics: attempt.analytics,
                violations: attempt.totalViolations
            }
        });

    } catch (error: any) {
        console.error('[Submit Error]', error);
        console.error('[Submit Error Stack]', error.stack);
        return NextResponse.json({ success: false, message: error.message || 'Failed to submit test', details: error.toString() }, { status: 500 });
    }
}
