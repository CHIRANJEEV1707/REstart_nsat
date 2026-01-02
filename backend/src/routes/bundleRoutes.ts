import express, { Request, Response } from 'express';
import Bundle from '../models/Bundle';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Get all active bundles
// @route   GET /api/bundles
// @access  Public
router.get('/', async (req: Request, res: Response) => {
    try {
        const bundles = await Bundle.find({ isActive: true }).select('-__v');
        res.json(bundles);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get single bundle by slug (and check access)
// @route   GET /api/bundles/:slug
// @access  Private (for full content) - Public (for preview info) -- Implementing as semi-protected
//          If user is logged in, we return a flag `hasAccess: true/false`. 
//          But real "content" protection logic should be here.
//          For now, this returns bundle details + access status.
router.get('/:slug', protect, async (req: any, res: Response) => {
    try {
        const bundle = await Bundle.findOne({ slug: req.params.slug });

        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }

        const user = await User.findById(req.user._id);
        const hasAccess = user?.purchasedBundles.some(
            (pb) => pb.bundleId.toString() === bundle._id.toString()
        );

        res.json({
            ...bundle.toObject(),
            hasAccess: !!hasAccess
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get owned bundles for current user
// @route   GET /api/bundles/my-bundles
// @access  Private
router.get('/my-bundles', protect, async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).populate('purchasedBundles.bundleId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.purchasedBundles);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
