import { Request, Response } from 'express';
import User from '../models/User';
import TestAttempt from '../models/TestAttempt';
import Question from '../models/Question';
import MockTest from '../models/MockTest';
import SessionBooking from '../models/SessionBooking';
import logger from '../utils/logger';

// @desc    Get NSAT dashboard data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const userId = req.user._id;

        // ── 1. Completed mock attempts ────────────────────────────────────
        const attempts = await TestAttempt.find({ userId, status: 'completed' })
            .populate('mockTestId', 'title slug examType totalMarks')
            .sort({ completedAt: -1 })
            .lean();

        const mockScores = attempts.map((a: any) => ({
            testId: a.mockTestId?._id,
            testTitle: a.mockTestId?.title || 'Unknown Test',
            testSlug: a.mockTestId?.slug,
            score: a.totalScore,
            maxScore: a.maxScore,
            percentage: a.percentage,
            completedAt: a.completedAt,
            attemptId: a._id,
        }));

        // ── 2. Total questions attempted (answered answers across all attempts) ─
        const totalQuestionsAttempted = attempts.reduce((sum: number, a: any) => {
            const answered = (a.answers || []).filter(
                (ans: any) => ans.status === 'answered' || ans.status === 'answered-marked-for-review'
            ).length;
            return sum + answered;
        }, 0);

        // ── 3. Question of the Day (deterministic by date, MCQ only) ─────
        let questionOfTheDay = null;
        try {
            const today = new Date();
            const dayIndex = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();

            const totalQs = await Question.countDocuments({
                questionType: { $ne: 'coding' },
                isCoding: { $ne: true },
                options: { $exists: true, $not: { $size: 0 } },
            });

            if (totalQs > 0) {
                const skip = dayIndex % totalQs;
                const q = await Question.findOne({
                    questionType: { $ne: 'coding' },
                    isCoding: { $ne: true },
                    options: { $exists: true, $not: { $size: 0 } },
                })
                    .skip(skip)
                    .select('questionText options correctAnswer explanation difficulty section')
                    .lean();

                if (q) {
                    questionOfTheDay = {
                        _id: q._id,
                        questionText: (q as any).questionText,
                        options: (q as any).options,
                        correctAnswer: (q as any).correctAnswer,
                        explanation: (q as any).explanation,
                        difficulty: (q as any).difficulty,
                        section: (q as any).section,
                    };
                }
            }
        } catch (e) {
            logger.error('QotD fetch error:', e);
        }

        // ── 4. Next upcoming session ──────────────────────────────────────
        let nextSession = null;
        try {
            const booking = await SessionBooking.findOne({
                userId,
                status: { $in: ['scheduled', 'paid'] },
                sessionDate: { $gte: new Date() },
            })
                .sort({ sessionDate: 1 })
                .lean();

            if (booking) {
                nextSession = {
                    _id: (booking as any)._id,
                    topic: (booking as any).sessionType,
                    sessionDate: (booking as any).sessionDate,
                    whatsappLink: null,
                };
            }
        } catch (e) {
            logger.error('Next session fetch error:', e);
        }

        res.status(200).json({
            success: true,
            data: {
                mockScores,
                totalQuestionsAttempted,
                questionOfTheDay,
                nextSession,
            },
        });
    } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
