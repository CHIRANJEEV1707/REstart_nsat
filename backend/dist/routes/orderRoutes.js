"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const Order_1 = __importDefault(require("../models/Order"));
const Bundle_1 = __importDefault(require("../models/Bundle"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
// @desc    Create Razorpay Order
// @route   POST /api/orders/create
// @access  Private
router.post('/create', auth_1.protect, async (req, res) => {
    try {
        const { bundleId } = req.body;
        const userId = req.user._id;
        const bundle = await Bundle_1.default.findById(bundleId);
        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }
        // Check if already purchased
        const user = await User_1.default.findById(userId);
        const alreadyPurchased = user?.purchasedBundles.some((pb) => pb.bundleId.toString() === bundleId);
        if (alreadyPurchased) {
            // In a real app, you might allow re-purchase or extension, but for now we block duplicates.
            return res.status(400).json({ message: 'You have already purchased this bundle' });
        }
        // Create Razorpay Order
        const options = {
            amount: bundle.price * 100, // Amount in paise
            currency: bundle.currency,
            receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Unique & < 40 chars
        };
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create(options);
        }
        catch (rzpError) {
            console.error("Razorpay Order Creation Error:", rzpError);
            return res.status(rzpError.statusCode || 400).json({
                message: 'Razorpay order creation failed',
                error: rzpError.error?.description || rzpError.message
            });
        }
        // Save local Order record
        const order = await Order_1.default.create({
            userId,
            bundleId,
            razorpayOrderId: razorpayOrder.id,
            amount: bundle.price,
            currency: bundle.currency,
            status: 'created',
        });
        res.status(201).json({
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: bundle.price,
            currency: bundle.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
router.post('/verify', auth_1.protect, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const userId = req.user._id;
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }
        // 1. Verify Signature
        const generated_signature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');
        if (generated_signature !== razorpaySignature) {
            // Mark order as failed? Or just return error.
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        // 2. Find Order
        const order = await Order_1.default.findOne({ razorpayOrderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // 3. Update Order Status
        order.status = 'paid';
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        await order.save();
        // 4. Grant Access to User
        const user = await User_1.default.findById(userId);
        if (user) {
            // Check if not already added (race condition check)
            const exists = user.purchasedBundles.some((pb) => pb.bundleId.toString() === order.bundleId.toString());
            if (!exists) {
                user.purchasedBundles.push({
                    bundleId: order.bundleId,
                    purchasedAt: new Date(),
                    orderId: razorpayOrderId,
                    paymentId: razorpayPaymentId,
                });
                await user.save();
            }
        }
        res.status(200).json({ success: true, message: 'Payment verified and bundle added' });
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
exports.default = router;
