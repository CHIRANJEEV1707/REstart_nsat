import { Router, Request, Response } from 'express';
import JEEQuestionBank from '../models/JEEQuestionBank';

const router = Router();

/**
 * GET /api/jee-bank/questions
 * List questions with filters
 */
router.get('/questions', async (req: Request, res: Response) => {
    try {
        const { subject, chapter, year, limit = 50, skip = 0 } = req.query;

        const filter: any = {};
        if (subject) filter.subject = subject;
        if (chapter) filter.chapter = chapter;
        if (year) filter.year = parseInt(year as string);

        const questions = await JEEQuestionBank.find(filter)
            .sort({ questionNumber: 1 })
            .skip(parseInt(skip as string))
            .limit(parseInt(limit as string))
            .lean();

        const total = await JEEQuestionBank.countDocuments(filter);

        res.json({
            success: true,
            data: questions,
            pagination: {
                total,
                limit: parseInt(limit as string),
                skip: parseInt(skip as string)
            }
        });
    } catch (error: any) {
        console.error('[JEE Bank Questions Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

/**
 * GET /api/jee-bank/chapters
 * Get chapters grouped by subject
 */
router.get('/chapters', async (req: Request, res: Response) => {
    try {
        const chapters = await JEEQuestionBank.aggregate([
            { $group: { _id: { subject: '$subject', chapter: '$chapter' }, count: { $sum: 1 } } },
            { $sort: { '_id.subject': 1, count: -1 } },
            {
                $group: {
                    _id: '$_id.subject',
                    chapters: { $push: { name: '$_id.chapter', count: '$count' } }
                }
            }
        ]);

        res.json({
            success: true,
            data: chapters.reduce((acc, curr) => {
                acc[curr._id] = curr.chapters;
                return acc;
            }, {} as Record<string, any[]>)
        });
    } catch (error: any) {
        console.error('[JEE Bank Chapters Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chapters' });
    }
});

/**
 * GET /api/jee-bank/stats
 * Get statistics about the question bank
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await JEEQuestionBank.aggregate([
            {
                $group: {
                    _id: '$subject',
                    count: { $sum: 1 },
                    chapters: { $addToSet: '$chapter' },
                    years: { $addToSet: '$year' }
                }
            }
        ]);

        const total = await JEEQuestionBank.countDocuments();

        res.json({
            success: true,
            data: {
                total,
                bySubject: stats.map(s => ({
                    subject: s._id,
                    count: s.count,
                    chaptersCount: s.chapters.length,
                    yearsRange: { min: Math.min(...s.years), max: Math.max(...s.years) }
                }))
            }
        });
    } catch (error: any) {
        console.error('[JEE Bank Stats Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

/**
 * POST /api/jee-bank/generate-mock
 * Generate a random mock test with 30 questions per subject (25 to attempt)
 */
router.post('/generate-mock', async (req: Request, res: Response) => {
    try {
        const subjects = ['Mathematics', 'Physics', 'Chemistry'];
        const sections = [];

        for (const subject of subjects) {
            // Get 30 random questions per subject
            const questions = await JEEQuestionBank.aggregate([
                { $match: { subject } },
                { $sample: { size: 30 } },
                { $project: { _id: 1, questionNumber: 1, questionText: 1, options: 1, isInteger: 1, difficulty: 1, chapter: 1 } }
            ]);

            sections.push({
                name: subject,
                questions,
                totalQuestions: 30,
                toAttempt: 25,
                marks: 100, // 4 marks each for 25 questions
                duration: 60 // 1 hour per section
            });
        }

        const mock = {
            title: 'JEE Mains PYQ Mock Test',
            slug: `jee-pyq-mock-${Date.now()}`,
            sections,
            totalQuestions: 90,
            toAttempt: 75,
            totalMarks: 300,
            duration: 180, // 3 hours
            generatedAt: new Date()
        };

        res.json({
            success: true,
            data: mock
        });
    } catch (error: any) {
        console.error('[JEE Bank Generate Mock Error]', error);
        res.status(500).json({ success: false, message: 'Failed to generate mock' });
    }
});

/**
 * POST /api/jee-bank/practice
 * Start a custom practice session
 */
router.post('/practice', async (req: Request, res: Response) => {
    try {
        const { subject, chapter, count = 10, random = true } = req.body;

        if (!subject) {
            return res.status(400).json({ success: false, message: 'Subject is required' });
        }

        const filter: any = { subject };
        if (chapter) filter.chapter = chapter;

        let questions;
        if (random) {
            questions = await JEEQuestionBank.aggregate([
                { $match: filter },
                { $sample: { size: parseInt(count) } }
            ]);
        } else {
            questions = await JEEQuestionBank.find(filter)
                .limit(parseInt(count))
                .lean();
        }

        res.json({
            success: true,
            data: {
                subject,
                chapter: chapter || 'All Chapters',
                questions,
                totalQuestions: questions.length
            }
        });
    } catch (error: any) {
        console.error('[JEE Bank Practice Error]', error);
        res.status(500).json({ success: false, message: 'Failed to start practice session' });
    }
});

/**
 * GET /api/jee-bank/question/:id
 * Get a single question by ID
 */
router.get('/question/:id', async (req: Request, res: Response) => {
    try {
        const question = await JEEQuestionBank.findById(req.params.id).lean();

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error: any) {
        console.error('[JEE Bank Question Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch question' });
    }
});

export default router;
