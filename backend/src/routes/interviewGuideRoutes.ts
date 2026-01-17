import express, { Request, Response } from 'express';
import InterviewGuide from '../models/InterviewGuide';
import FreePackClaim from '../models/FreePackClaim';
import { protect } from '../middleware/auth';

const router = express.Router();

// Helper to check premium access
const hasPremiumAccess = async (userId: string) => {
    const User = require('../models/User').default;
    const user = await User.findById(userId);
    return user?.purchasedBundles?.length > 0;
};

// @desc    Get all interview guides (metadata only)
// @route   GET /api/interview-guides
// @access  Public
router.get('/', async (req: Request, res: Response) => {
    try {
        const { guideType } = req.query;

        const filter: any = { isActive: true };
        if (guideType) filter.guideType = guideType;

        const guides = await InterviewGuide.find(filter)
            .select('title slug guideType description isFree order')
            .sort({ order: 1 });

        res.json({
            success: true,
            count: guides.length,
            data: guides
        });
    } catch (error: any) {
        console.error('[Interview Guides List Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch guides' });
    }
});

// @desc    Get single interview guide content
// @route   GET /api/interview-guides/:slug
// @access  Private (with access control)
router.get('/:slug', protect, async (req: any, res: Response) => {
    try {
        const guide = await InterviewGuide.findOne({
            slug: req.params.slug,
            isActive: true
        });

        if (!guide) {
            return res.status(404).json({ success: false, message: 'Guide not found' });
        }

        // Check access
        const isPremium = await hasPremiumAccess(req.user._id);
        const hasFree = await FreePackClaim.findOne({ userId: req.user._id });

        if (!guide.isFree && !isPremium) {
            // Return limited preview only
            return res.json({
                success: true,
                data: {
                    title: guide.title,
                    slug: guide.slug,
                    guideType: guide.guideType,
                    description: guide.description,
                    tips: guide.tips.slice(0, 3), // First 3 tips only
                    sampleQuestions: guide.sampleQuestions.slice(0, 2), // 2 samples
                    content: guide.content.substring(0, 500) + '...', // Preview
                    isFree: false,
                    isLimited: true,
                    message: 'Upgrade to premium for full access'
                }
            });
        }

        res.json({
            success: true,
            data: guide
        });
    } catch (error: any) {
        console.error('[Interview Guide Get Error]', error);
        res.status(500).json({ success: false, message: 'Failed to fetch guide' });
    }
});

export default router;
