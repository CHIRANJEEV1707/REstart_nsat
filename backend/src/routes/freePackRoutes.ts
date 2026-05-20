import express, { Response } from 'express';
import FreePackClaim from '../models/FreePackClaim';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

const getStatus = async (userId: string) => {
    const claim = await FreePackClaim.findOne({ userId });
    const user = await User.findById(userId);
    const isPremium = (user?.purchasedBundles || []).some((b: any) =>
        (b.verificationStatus === 'active' || b.verificationStatus === 'approved') &&
        b.productSlug?.includes('premium')
    );
    return {
        hasFreepack: !!claim,
        claimedAt: claim?.claimedAt,
        isPremium,
        accessLevel: isPremium ? 'premium' : (claim ? 'free' : 'none')
    };
};

// @desc    Check free pack status (root path used by frontend)
// @route   GET /api/free-pack
// @access  Private
router.get('/', protect, async (req: any, res: Response) => {
    try {
        const data = await getStatus(req.user._id);
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('[Free Pack Status Error]', error);
        res.status(500).json({ success: false, message: 'Failed to check status' });
    }
});

const claimHandler = async (req: any, res: Response) => {
    try {
        const existingClaim = await FreePackClaim.findOne({ userId: req.user._id });

        if (existingClaim) {
            return res.json({
                success: true,
                message: 'Free pack already claimed',
                data: existingClaim,
                alreadyClaimed: true
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const claim = await FreePackClaim.create({
            userId: req.user._id,
            email: user.email,
            phone: req.body.phoneNumber || user.profile?.phoneNumber,
            registeredName: req.body.name,
            registeredEmail: req.body.registeredEmail,
            stream: req.body.stream || 'general',
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
};

// @desc    Claim free pack (root path used by frontend)
// @route   POST /api/free-pack
// @access  Private
router.post('/', protect, claimHandler);

// @desc    Claim free pack (legacy path)
// @route   POST /api/free-pack/claim
// @access  Private
router.post('/claim', protect, claimHandler);

// @desc    Check free pack status (legacy path)
// @route   GET /api/free-pack/status
// @access  Private
router.get('/status', protect, async (req: any, res: Response) => {
    try {
        const data = await getStatus(req.user._id);
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('[Free Pack Status Error]', error);
        res.status(500).json({ success: false, message: 'Failed to check status' });
    }
});

export default router;
