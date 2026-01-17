import express, { Request, Response } from 'express';
import PYQCategory from '../models/PYQCategory';
import PYQQuestion from '../models/PYQQuestion';
import FreePackClaim from '../models/FreePackClaim';
import { protect } from '../middleware/auth';

const router = express.Router();

// Helper to check premium access
const hasPremiumAccess = async (userId: string) => {
    const User = require('../models/User').default;
    const user = await User.findById(userId);
    return user?.purchasedBundles?.length > 0;
};

// @desc    Get all PYQ categories
// @route   GET /api/pyqs/categories
// @access  Public
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const { examType } = req.query;

        const filter: any = { isActive: true };
        if (examType) filter.examType = examType;

        const categories = await PYQCategory.find(filter)
            .sort({ year: -1, order: 1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error: any) {
        console.error('[PYQ Categories Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

// @desc    Get questions for a category
// @route   GET /api/pyqs/:categoryId/questions
// @access  Private (with access control)
router.get('/:categoryId/questions', protect, async (req: any, res: Response) => {
    try {
        const category = await PYQCategory.findById(req.params.categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Check access
        const isPremium = await hasPremiumAccess(req.user._id);
        const hasFree = await FreePackClaim.findOne({ userId: req.user._id });

        if (!category.isFree && !isPremium) {
            return res.status(403).json({
                success: false,
                message: 'Premium access required for this year\'s PYQs',
                requiresPurchase: true
            });
        }

        // Free pack gives access to free categories only
        if (!category.isFree && !isPremium && hasFree) {
            return res.status(403).json({
                success: false,
                message: 'Upgrade to premium for access to all years',
                requiresPurchase: true
            });
        }

        const questions = await PYQQuestion.find({ categoryId: category._id })
            .sort({ questionNumber: 1 });

        res.json({
            success: true,
            category,
            count: questions.length,
            data: questions
        });
    } catch (error: any) {
        console.error('[PYQ Questions Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

export default router;
