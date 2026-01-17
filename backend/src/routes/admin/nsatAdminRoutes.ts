import express, { Response } from 'express';
import MockTest from '../../models/MockTest';
import Question from '../../models/Question';
import PYQCategory from '../../models/PYQCategory';
import PYQQuestion from '../../models/PYQQuestion';
import InterviewGuide from '../../models/InterviewGuide';
import { protect, admin } from '../../middleware/auth';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// ============== MOCK TESTS ==============

// @desc    Create mock test
// @route   POST /api/admin/nsat/mock-tests
router.post('/mock-tests', async (req: any, res: Response) => {
    try {
        const test = await MockTest.create(req.body);
        res.status(201).json({ success: true, data: test });
    } catch (error: any) {
        console.error('[Admin Create Test Error]', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update mock test
// @route   PUT /api/admin/nsat/mock-tests/:id
router.put('/mock-tests/:id', async (req: any, res: Response) => {
    try {
        const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, data: test });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete mock test
// @route   DELETE /api/admin/nsat/mock-tests/:id
router.delete('/mock-tests/:id', async (req: any, res: Response) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        await Question.deleteMany({ mockTestId: req.params.id });
        res.json({ success: true, message: 'Test and questions deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Add question to test
// @route   POST /api/admin/nsat/mock-tests/:id/questions
router.post('/mock-tests/:id/questions', async (req: any, res: Response) => {
    try {
        const question = await Question.create({ ...req.body, mockTestId: req.params.id });
        res.status(201).json({ success: true, data: question });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Bulk add questions
// @route   POST /api/admin/nsat/mock-tests/:id/questions/bulk
router.post('/mock-tests/:id/questions/bulk', async (req: any, res: Response) => {
    try {
        const questions = req.body.questions.map((q: any) => ({
            ...q,
            mockTestId: req.params.id
        }));
        const created = await Question.insertMany(questions);
        res.status(201).json({ success: true, count: created.length, data: created });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all questions for a test
// @route   GET /api/admin/nsat/mock-tests/:id/questions
router.get('/mock-tests/:id/questions', async (req: any, res: Response) => {
    try {
        const questions = await Question.find({ mockTestId: req.params.id })
            .sort({ section: 1, questionNumber: 1 });
        res.json({ success: true, data: questions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update question
// @route   PUT /api/admin/nsat/questions/:id
router.put('/questions/:id', async (req: any, res: Response) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
        res.json({ success: true, data: question });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete question
// @route   DELETE /api/admin/nsat/questions/:id
router.delete('/questions/:id', async (req: any, res: Response) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== PYQ ==============

// @desc    Create PYQ category
// @route   POST /api/admin/nsat/pyq-categories
router.post('/pyq-categories', async (req: any, res: Response) => {
    try {
        const category = await PYQCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update PYQ category
// @route   PUT /api/admin/nsat/pyq-categories/:id
router.put('/pyq-categories/:id', async (req: any, res: Response) => {
    try {
        const category = await PYQCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Add PYQ question
// @route   POST /api/admin/nsat/pyq-categories/:id/questions
router.post('/pyq-categories/:id/questions', async (req: any, res: Response) => {
    try {
        const question = await PYQQuestion.create({ ...req.body, categoryId: req.params.id });
        // Update question count
        await PYQCategory.findByIdAndUpdate(req.params.id, { $inc: { questionCount: 1 } });
        res.status(201).json({ success: true, data: question });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Bulk add PYQ questions
// @route   POST /api/admin/nsat/pyq-categories/:id/questions/bulk
router.post('/pyq-categories/:id/questions/bulk', async (req: any, res: Response) => {
    try {
        const questions = req.body.questions.map((q: any) => ({
            ...q,
            categoryId: req.params.id
        }));
        const created = await PYQQuestion.insertMany(questions);
        await PYQCategory.findByIdAndUpdate(req.params.id, { $inc: { questionCount: created.length } });
        res.status(201).json({ success: true, count: created.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== INTERVIEW GUIDES ==============

// @desc    Create interview guide
// @route   POST /api/admin/nsat/interview-guides
router.post('/interview-guides', async (req: any, res: Response) => {
    try {
        const guide = await InterviewGuide.create(req.body);
        res.status(201).json({ success: true, data: guide });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update interview guide
// @route   PUT /api/admin/nsat/interview-guides/:id
router.put('/interview-guides/:id', async (req: any, res: Response) => {
    try {
        const guide = await InterviewGuide.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
        res.json({ success: true, data: guide });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete interview guide
// @route   DELETE /api/admin/nsat/interview-guides/:id
router.delete('/interview-guides/:id', async (req: any, res: Response) => {
    try {
        await InterviewGuide.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Guide deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all guides (admin view)
// @route   GET /api/admin/nsat/interview-guides
router.get('/interview-guides', async (req: any, res: Response) => {
    try {
        const guides = await InterviewGuide.find().sort({ order: 1 });
        res.json({ success: true, data: guides });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
