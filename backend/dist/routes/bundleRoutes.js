"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Bundle_1 = __importDefault(require("../models/Bundle"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @desc    Get all active bundles
// @route   GET /api/bundles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const bundles = await Bundle_1.default.find({ isActive: true }).select('-__v');
        res.json(bundles);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
// @desc    Get single bundle by slug (and check access)
// @route   GET /api/bundles/:slug
// @access  Private (for full content) - Public (for preview info) -- Implementing as semi-protected
//          If user is logged in, we return a flag `hasAccess: true/false`. 
//          But real "content" protection logic should be here.
//          For now, this returns bundle details + access status.
router.get('/:slug', auth_1.protect, async (req, res) => {
    try {
        const bundle = await Bundle_1.default.findOne({ slug: req.params.slug });
        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }
        const user = await User_1.default.findById(req.user._id);
        const hasAccess = user?.purchasedBundles.some((pb) => pb.bundleId.toString() === bundle._id.toString());
        res.json({
            ...bundle.toObject(),
            hasAccess: !!hasAccess
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
// @desc    Get owned bundles for current user
// @route   GET /api/bundles/my-bundles
// @access  Private
router.get('/my-bundles', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).populate('purchasedBundles.bundleId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.purchasedBundles);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.default = router;
