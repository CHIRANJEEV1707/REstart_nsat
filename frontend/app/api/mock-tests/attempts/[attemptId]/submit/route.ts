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

            // Check verified status from payload OR DB
            const isVerifiedPayload = (ans as any).isVerified;
            const isVerifiedDB = (attempt.answers[answerIndex] as any)?.isVerified;

            // Console Log Debugging
            if (question.questionType === 'coding' || question.isCoding) {
                console.log(`[DEBUG] Scoring Coding Q: ${question._id}`);
                console.log(`[DEBUG] Payload isVerified: ${isVerifiedPayload}`);
                console.log(`[DEBUG] DB isVerified: ${isVerifiedDB}`);
                console.log(`[DEBUG] Question Type: ${question.questionType}, IsCoding: ${question.isCoding}`);
            }

            if (!selectedAnswer || selectedAnswer === '') {
                sectionScores[question.section].unattempted += 1;
            } else if (selectedAnswer === question.correctAnswer) {
                // Correct (MCQ)
                isCorrect = true;
                marksAwarded = question.marks;
                totalScore += question.marks;
                sectionScores[question.section].score += question.marks;
                sectionScores[question.section].correct += 1;
            } else if ((question.questionType === 'coding' || question.isCoding) && (isVerifiedPayload || isVerifiedDB)) {
                // Correct (Coding)
                console.log('[DEBUG] Marking Coding Question CORRECT');
                isCorrect = true;
                marksAwarded = question.marks;
                totalScore += question.marks;
                sectionScores[question.section].score += question.marks;
                sectionScores[question.section].correct += 1;
                // Ensure verifying flag is saved in DB if it was payload-only
                if (answerIndex !== -1) {
                    (attempt.answers[answerIndex] as any).isVerified = true;
                }
            } else {
                marksAwarded = -question.negativeMarks;
                totalScore -= question.negativeMarks;
                sectionScores[question.section].score -= question.negativeMarks;
                sectionScores[question.section].incorrect += 1;
            }

            // Accumulate time spent
            if (ans.timeSpent) {
                sectionScores[question.section].timeSpent += ans.timeSpent;
            }

            // Update attempt.answers
            if (answerIndex !== -1) {
                attempt.answers[answerIndex].isCorrect = isCorrect;
                attempt.answers[answerIndex].marksAwarded = marksAwarded;
                attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
                if (ans.timeSpent) {
                    attempt.answers[answerIndex].timeSpent = ans.timeSpent;
                }
            }
        }

        console.log('[Submit] Scoring complete. Total Score:', totalScore);

        // ===== FIXED: Section Analytics with CORRECT Accuracy Formula =====
        const sectionAnalytics = Object.values(sectionScores).map((s: any) => {
            const attempted = s.correct + s.incorrect;
            // CORRECT FORMULA: accuracy = correct / attempted (not including unattempted)
            const accuracy = attempted > 0 ? (s.correct / attempted) * 100 : 0;
            return {
                ...s,
                accuracy: Math.round(accuracy)
            };
        });

        // Identify weak and strong areas
        const weakAreas = sectionAnalytics.filter((s: any) => s.accuracy < 50).map((s: any) => s.section);
        const strongAreas = sectionAnalytics.filter((s: any) => s.accuracy >= 70).map((s: any) => s.section);

        // Ensure maxScore is set
        if (!attempt.maxScore || attempt.maxScore === 0) {
            const MockTest = require('@/lib/models/MockTest').default;
            const test = await MockTest.findById(attempt.mockTestId);
            if (test) {
                attempt.maxScore = test.totalMarks;
            } else {
                attempt.maxScore = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.maxScore, 0);
            }
        }

        // Update basic attempt fields
        attempt.status = 'completed';
        attempt.completedAt = new Date();
        attempt.totalScore = Math.max(0, totalScore); // Floor at 0 for display, but store actual

        const maxScore = attempt.maxScore || 1;
        attempt.percentage = (Math.max(0, totalScore) / maxScore) * 100;
        attempt.totalTimeSpent = totalTimeSpent || 0;

        // ===== FIXED: Calculate REAL Rank & Percentile =====
        // Get all completed attempts for this mock test
        const allAttempts = await TestAttempt.find({
            mockTestId: attempt.mockTestId,
            status: 'completed'
        }).select('totalScore userId').lean();

        // Count unique participants
        const uniqueUsers = new Set(allAttempts.map(a => a.userId.toString()));
        const totalParticipants = uniqueUsers.size + 1; // +1 because current attempt not yet saved

        // Calculate rank (1-indexed, lower is better)
        // Count how many scored STRICTLY higher than this user
        const higherScores = allAttempts.filter(a => a.totalScore > totalScore).length;
        const rank = higherScores + 1;

        // Calculate percentile (what percentage of test-takers scored BELOW you)
        // Standard formula: percentile = ((rank position from bottom) / total) * 100
        // If rank=1 of 10, you're in 90th-100th percentile (top 10%)
        // If rank=3 of 3, you're in 1st-33rd percentile
        // We use: percentile = Math.round(((totalParticipants - rank) / totalParticipants) * 100)
        // This gives 0 for last place, 90 for rank 1 of 10
        // But we cap at 99 for first place (not 100) to be realistic
        let percentile: number;
        if (totalParticipants <= 1) {
            percentile = 99; // Only participant
        } else {
            // Number of people you beat = (totalParticipants - rank)
            // Percentile = (people you beat / (total - 1)) * 100
            // For rank=1 of 3: (3-1)/(3-1)*100 = 100, cap to 99
            // For rank=2 of 3: (3-2)/(3-1)*100 = 50
            // For rank=3 of 3: (3-3)/(3-1)*100 = 0
            percentile = Math.min(99, Math.round(((totalParticipants - rank) / (totalParticipants - 1)) * 100));
        }

        // ===== FIXED: Overall Accuracy (correct / attempted, not total) =====
        const totalCorrect = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.correct, 0);
        const totalIncorrect = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.incorrect, 0);
        const totalAttempted = totalCorrect + totalIncorrect;
        const overallAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

        // Generate better recommendations
        const recommendations: string[] = [];
        if (weakAreas.length > 0) {
            recommendations.push(`Focus on improving: ${weakAreas.join(', ')}`);
        }
        if (strongAreas.length > 0) {
            recommendations.push(`Maintain your strength in: ${strongAreas.join(', ')}`);
        }

        // Time-based recommendations
        const totalQuestionsCount = Object.values(sectionScores).reduce((acc: number, s: any) =>
            acc + s.correct + s.incorrect + s.unattempted, 0);
        const unattemptedCount = Object.values(sectionScores).reduce((acc: number, s: any) => acc + s.unattempted, 0);

        if (unattemptedCount > totalQuestionsCount * 0.2) {
            recommendations.push(`You left ${unattemptedCount} questions unattempted. Practice time management.`);
        }
        if (totalIncorrect > totalCorrect) {
            recommendations.push('Focus on accuracy over speed. Avoid guessing incorrectly.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Great performance! Keep up the good work.');
        }

        attempt.analytics = {
            sectionWise: sectionAnalytics,
            accuracy: Math.round(overallAccuracy),
            percentile,
            rank,
            totalParticipants,
            weakAreas,
            strongAreas,
            recommendations
        };

        console.log(`[Submit] Analytics: Rank ${rank}/${totalParticipants}, Percentile ${percentile}, Accuracy ${Math.round(overallAccuracy)}%`);

        attempt.markModified('answers');
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

