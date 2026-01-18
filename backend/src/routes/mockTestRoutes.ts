import express, { Request, Response } from 'express';
import MockTest from '../models/MockTest';
import Question from '../models/Question';
import TestAttempt from '../models/TestAttempt';
import FreePackClaim from '../models/FreePackClaim';
import { protect } from '../middleware/auth';

const router = express.Router();

// Helper to check premium access
const hasPremiumAccess = async (userId: string) => {
    // Check if user has any purchased bundle that grants premium access
    const User = require('../models/User').default;
    const user = await User.findById(userId);
    return user?.purchasedBundles?.length > 0;
};

// Helper to check free pack claim
const hasFreePackAccess = async (userId: string) => {
    const claim = await FreePackClaim.findOne({ userId });
    return !!claim;
};

// @desc    Get all mock tests (public listing)
// @route   GET /api/mock-tests
// @access  Public
router.get('/', async (req: Request, res: Response) => {
    try {
        const { examType } = req.query;

        const filter: any = { isActive: true };
        if (examType) filter.examType = examType;

        const tests = await MockTest.find(filter)
            .select('title slug description examType duration totalMarks sections isFree isPremium difficulty order')
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: tests.length,
            data: tests
        });
    } catch (error: any) {
        console.error('[MockTest List Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mock tests' });
    }
});

// @desc    Get single mock test details (without questions)
// @route   GET /api/mock-tests/:slug
// @access  Public
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const test = await MockTest.findOne({ slug: req.params.slug, isActive: true });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        res.json({
            success: true,
            data: test
        });
    } catch (error: any) {
        console.error('[MockTest Get Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mock test' });
    }
});

// @desc    Start a test attempt
// @route   POST /api/mock-tests/:slug/start
// @access  Private
router.post('/:slug/start', protect, async (req: any, res: Response) => {
    try {
        const test = await MockTest.findOne({ slug: req.params.slug, isActive: true });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Check access
        const isPremium = await hasPremiumAccess(req.user._id);
        const hasFree = await hasFreePackAccess(req.user._id);

        if (!test.isFree && !isPremium) {
            // Check if it's a free pack test and user has claimed
            if (!hasFree || !test.isFree) {
                return res.status(403).json({
                    success: false,
                    message: 'Premium access required',
                    requiresPurchase: true
                });
            }
        }

        // Check for existing in-progress attempt
        const existingAttempt = await TestAttempt.findOne({
            userId: req.user._id,
            mockTestId: test._id,
            status: 'in-progress'
        });

        if (existingAttempt) {
            // Return existing attempt with questions
            const questions = await Question.find({ mockTestId: test._id })
                .select('-correctAnswer -explanation')
                .sort({ section: 1, questionNumber: 1 });

            return res.json({
                success: true,
                message: 'Resuming existing attempt',
                data: {
                    attempt: existingAttempt,
                    test,
                    questions
                }
            });
        }

        // Get all questions for this test
        const questions = await Question.find({ mockTestId: test._id })
            .sort({ section: 1, questionNumber: 1 });

        // Create new attempt
        const attempt = await TestAttempt.create({
            userId: req.user._id,
            mockTestId: test._id,
            timeAllowed: test.duration * 60, // Convert to seconds
            maxScore: test.totalMarks,
            answers: questions.map(q => ({
                questionId: q._id,
                selectedAnswer: '',
                isCorrect: false,
                marksAwarded: 0,
                timeSpent: 0,
                status: 'not-visited' as 'not-visited'
            })),
            cameraEnabled: req.body.cameraEnabled || false
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
            isCoding: q.isCoding,
            difficulty: q.difficulty,
            constraints: q.constraints,
            codeTemplate: q.codeTemplate,
            // Send all test cases but only show input/output for non-hidden ones
            // The code execution API will handle hiding details in the response
            testCases: q.testCases?.map(tc => ({
                input: tc.isHidden ? '' : tc.input,
                expectedOutput: tc.isHidden ? '' : tc.expectedOutput,
                isHidden: tc.isHidden
            }))
        }));


        res.json({
            success: true,
            data: {
                attempt,
                test,
                questions: questionsWithoutAnswers
            }
        });
    } catch (error: any) {
        console.error('[MockTest Start Error]', error);
        res.status(500).json({ success: false, message: 'Failed to start test' });
    }
});

// @desc    Save answer (auto-save during test)
// @route   POST /api/mock-tests/attempts/:attemptId/save-answer
// @access  Private
router.post('/attempts/:attemptId/save-answer', protect, async (req: any, res: Response) => {
    try {
        const { questionId, selectedAnswer, timeSpent, status, isVerified } = req.body;

        const attempt = await TestAttempt.findOne({
            _id: req.params.attemptId,
            userId: req.user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Update the answer
        const answerIndex = attempt.answers.findIndex(
            a => a.questionId.toString() === questionId
        );

        if (answerIndex !== -1) {
            attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
            attempt.answers[answerIndex].timeSpent = timeSpent;
            if (status) attempt.answers[answerIndex].status = status;
            if (isVerified !== undefined) attempt.answers[answerIndex].isVerified = isVerified;
            await attempt.save();
        }

        res.json({ success: true, message: 'Answer saved' });
    } catch (error: any) {
        console.error('[SaveAnswer Error]', error);
        res.status(500).json({ success: false, message: 'Failed to save answer' });
    }
});

// @desc    Record proctoring violation
// @route   POST /api/mock-tests/attempts/:attemptId/violation
// @access  Private
router.post('/attempts/:attemptId/violation', protect, async (req: any, res: Response) => {
    try {
        const { type } = req.body;

        const attempt = await TestAttempt.findOne({
            _id: req.params.attemptId,
            userId: req.user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Add violation
        attempt.violations.push({ type, timestamp: new Date() });
        attempt.totalViolations += 1;

        // Update summary
        if (type === 'tab_switch') attempt.proctoringSummary.tabSwitches += 1;
        if (type === 'fullscreen_exit') attempt.proctoringSummary.fullscreenExits += 1;
        if (type === 'window_blur') attempt.proctoringSummary.windowBlurs += 1;

        await attempt.save();

        res.json({ success: true, totalViolations: attempt.totalViolations });
    } catch (error: any) {
        console.error('[Violation Error]', error);
        res.status(500).json({ success: false, message: 'Failed to record violation' });
    }
});

// @desc    Submit test and calculate score
// @route   POST /api/mock-tests/attempts/:attemptId/submit
// @access  Private
router.post('/attempts/:attemptId/submit', protect, async (req: any, res: Response) => {
    try {
        const { answers, totalTimeSpent } = req.body;

        const attempt = await TestAttempt.findOne({
            _id: req.params.attemptId,
            userId: req.user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found or already submitted' });
        }

        // Get questions with correct answers
        const questions = await Question.find({ mockTestId: attempt.mockTestId });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        // Calculate scores
        let totalScore = 0;
        const sectionScores: { [key: string]: { score: number; maxScore: number; correct: number; incorrect: number; unattempted: number; timeSpent: number } } = {};

        // Process each answer
        for (const ans of (answers || attempt.answers)) {
            const question = questionMap.get(ans.questionId.toString());
            if (!question) continue;

            // Initialize section if not exists
            if (!sectionScores[question.section]) {
                sectionScores[question.section] = {
                    score: 0, maxScore: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0
                };
            }
            sectionScores[question.section].maxScore += question.marks;

            const answerIndex = attempt.answers.findIndex(
                a => a.questionId.toString() === ans.questionId.toString()
            );

            // Console Log Debugging
            if (question.questionType === 'coding' || question.isCoding) {
                console.log(`[DEBUG] Scoring Coding Q: ${question._id}`);
                console.log(`[DEBUG] Payload isVerified: ${ans.isVerified}`);
                console.log(`[DEBUG] DB isVerified: ${answerIndex !== -1 ? attempt.answers[answerIndex].isVerified : 'N/A'}`);
                console.log(`[DEBUG] Question Type: ${question.questionType}, IsCoding: ${question.isCoding}`);
            }

            if (!ans.selectedAnswer || ans.selectedAnswer === '') {
                // Unattempted
                sectionScores[question.section].unattempted += 1;
                if (answerIndex !== -1) {
                    attempt.answers[answerIndex].isCorrect = false;
                    attempt.answers[answerIndex].marksAwarded = 0;
                }
            } else if (ans.selectedAnswer === question.correctAnswer) {
                // Correct (MCQ)
                totalScore += question.marks;
                sectionScores[question.section].score += question.marks;
                sectionScores[question.section].correct += 1;
                if (answerIndex !== -1) {
                    attempt.answers[answerIndex].isCorrect = true;
                    attempt.answers[answerIndex].marksAwarded = question.marks;
                    attempt.answers[answerIndex].selectedAnswer = ans.selectedAnswer;
                }
            } else if ((question.questionType === 'coding' || question.isCoding) && (ans.isVerified || (answerIndex !== -1 && attempt.answers[answerIndex].isVerified))) {
                // Correct (Coding - Verified by frontend execution OR stored verification)
                console.log('[DEBUG] Marking Coding Question CORRECT');
                totalScore += question.marks;
                sectionScores[question.section].score += question.marks;
                sectionScores[question.section].correct += 1;
                if (answerIndex !== -1) {
                    attempt.answers[answerIndex].isCorrect = true;
                    attempt.answers[answerIndex].isVerified = true; // Ensure DB is updated
                    attempt.answers[answerIndex].marksAwarded = question.marks;
                    attempt.answers[answerIndex].selectedAnswer = ans.selectedAnswer;
                }
            } else {
                // Incorrect
                totalScore -= question.negativeMarks;
                sectionScores[question.section].score -= question.negativeMarks;
                sectionScores[question.section].incorrect += 1;
                if (answerIndex !== -1) {
                    attempt.answers[answerIndex].isCorrect = false;
                    attempt.answers[answerIndex].marksAwarded = -question.negativeMarks;
                    attempt.answers[answerIndex].selectedAnswer = ans.selectedAnswer;
                }
            }

            if (answerIndex !== -1 && ans.timeSpent) {
                attempt.answers[answerIndex].timeSpent = ans.timeSpent;
                sectionScores[question.section].timeSpent += ans.timeSpent;
            }
        }

        // Calculate percentile and ranking
        const allAttempts = await TestAttempt.find({
            mockTestId: attempt.mockTestId,
            status: 'completed'
        }).select('totalScore');

        const higherScores = allAttempts.filter(a => a.totalScore > totalScore).length;
        const totalParticipants = allAttempts.length + 1;
        const rank = higherScores + 1;
        const percentile = ((totalParticipants - rank) / totalParticipants) * 100;

        // Identify weak and strong areas
        const sectionAnalytics = Object.entries(sectionScores).map(([section, data]) => ({
            section,
            ...data,
            accuracy: data.correct / (data.correct + data.incorrect + data.unattempted) * 100 || 0
        }));

        const weakAreas = sectionAnalytics
            .filter(s => s.accuracy < 50)
            .map(s => s.section);

        const strongAreas = sectionAnalytics
            .filter(s => s.accuracy >= 70)
            .map(s => s.section);

        // Generate recommendations
        const recommendations: string[] = [];
        if (weakAreas.length > 0) {
            recommendations.push(`Focus on ${weakAreas.join(', ')} - your accuracy is below 50%`);
        }
        const unattemptedTotal = sectionAnalytics.reduce((acc, s) => acc + s.unattempted, 0);
        const totalQuestions = questions.length;
        if (unattemptedTotal / totalQuestions > 0.3) {
            recommendations.push('Work on time management - over 30% questions unattempted');
        }
        if (strongAreas.length > 0) {
            recommendations.push(`Great work on ${strongAreas.join(', ')} - maintain this performance`);
        }

        // Update attempt
        attempt.status = 'completed';
        attempt.completedAt = new Date();
        attempt.totalScore = Math.max(0, totalScore);
        attempt.percentage = (Math.max(0, totalScore) / attempt.maxScore) * 100;
        attempt.totalTimeSpent = totalTimeSpent || 0;

        attempt.analytics = {
            sectionWise: sectionAnalytics,
            percentile: Math.round(percentile * 10) / 10,
            rank,
            totalParticipants,
            weakAreas,
            strongAreas,
            recommendations
        };

        await attempt.save();

        res.json({
            success: true,
            data: {
                totalScore: attempt.totalScore,
                maxScore: attempt.maxScore,
                percentage: attempt.percentage,
                analytics: attempt.analytics,
                violations: attempt.totalViolations,
                proctoringSummary: attempt.proctoringSummary
            }
        });
    } catch (error: any) {
        console.error('[MockTest Submit Error]', error);
        res.status(500).json({ success: false, message: 'Failed to submit test' });
    }
});

// @desc    Get user's attempt history
// @route   GET /api/mock-tests/attempts
// @access  Private
router.get('/attempts/history', protect, async (req: any, res: Response) => {
    try {
        const attempts = await TestAttempt.find({
            userId: req.user._id,
            status: 'completed'
        })
            .populate('mockTestId', 'title slug examType')
            .select('totalScore maxScore percentage completedAt analytics.percentile analytics.rank')
            .sort({ completedAt: -1 });

        res.json({
            success: true,
            data: attempts
        });
    } catch (error: any) {
        console.error('[Attempts History Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attempt history' });
    }
});

// @desc    Get detailed attempt results (Premium only)
// @route   GET /api/mock-tests/attempts/:attemptId
// @access  Private
router.get('/attempts/:attemptId', protect, async (req: any, res: Response) => {
    try {
        const attempt = await TestAttempt.findOne({
            _id: req.params.attemptId,
            userId: req.user._id
        }).populate('mockTestId');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Check premium access for full analytics
        const isPremium = await hasPremiumAccess(req.user._id);

        // Get questions with explanations for review
        const questions = await Question.find({ mockTestId: attempt.mockTestId });

        const result: any = {
            attempt: {
                ...attempt.toObject(),
                analytics: isPremium ? attempt.analytics : {
                    percentile: attempt.analytics?.percentile,
                    rank: attempt.analytics?.rank,
                    totalParticipants: attempt.analytics?.totalParticipants
                    // Hide detailed analytics for non-premium
                }
            },
            questions: questions.map(q => ({
                ...q.toObject(),
                userAnswer: attempt.answers.find(a => a.questionId.toString() === q._id.toString())
            })),
            isPremium
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('[Attempt Detail Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attempt details' });
    }
});

export default router;
