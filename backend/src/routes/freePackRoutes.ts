import express, { Response } from 'express';
import FreePackClaim from '../models/FreePackClaim';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Claim free pack
// @route   POST /api/free-pack/claim
// @access  Private
router.post('/claim', protect, async (req: any, res: Response) => {
    try {
        // Check if already claimed
        const existingClaim = await FreePackClaim.findOne({ userId: req.user._id });

        if (existingClaim) {
            return res.json({
                success: true,
                message: 'Free pack already claimed',
                data: existingClaim,
                alreadyClaimed: true
            });
        }

        // Get user details
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create claim
        const claim = await FreePackClaim.create({
            userId: req.user._id,
            email: user.email,
            phone: req.body.phone || user.profile?.phoneNumber,
            source: req.body.source || 'direct'
        });

        res.status(201).json({
            success: true,
            message: 'Free pack claimed successfully!',
            data: claim
        });
    } catch (error: any) {
        console.error('[Free Pack Claim Error]', error);
        res.status(500).json({ success: false, message: 'Failed to claim free pack' });
    }
});

// @desc    Check free pack status
// @route   GET /api/free-pack/status
// @access  Private
router.get('/status', protect, async (req: any, res: Response) => {
    try {
        const claim = await FreePackClaim.findOne({ userId: req.user._id });

        // Also check premium status
        const user = await User.findById(req.user._id);
        const isPremium = (user?.purchasedBundles?.length ?? 0) > 0;

        res.json({
            success: true,
            data: {
                hasFreepack: !!claim,
                claimedAt: claim?.claimedAt,
                isPremium,
                accessLevel: isPremium ? 'premium' : (claim ? 'free' : 'none')
            }
        });
    } catch (error: any) {
        console.error('[Free Pack Status Error]', error);
        res.status(500).json({ success: false, message: 'Failed to check status' });
    }
});

export default router;
