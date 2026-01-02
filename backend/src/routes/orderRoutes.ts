import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import Bundle from '../models/Bundle';
import User from '../models/User';
import { protect } from '../middleware/auth';
import { IOrder } from '../models/Order';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// @desc    Create Razorpay Order
// @route   POST /api/orders/create
// @access  Private
router.post('/create', protect, async (req: any, res: Response) => {
    try {
        const { bundleId } = req.body;
        const userId = req.user._id;

        const bundle = await Bundle.findById(bundleId);
        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }

        // Check if already purchased
        const user = await User.findById(userId);
        const alreadyPurchased = user?.purchasedBundles.some(
            (pb) => pb.bundleId.toString() === bundleId
        );

        if (alreadyPurchased) {
            // In a real app, you might allow re-purchase or extension, but for now we block duplicates.
            return res.status(400).json({ message: 'You have already purchased this bundle' });
        }

        // Create Razorpay Order
        const options = {
            amount: bundle.price * 100, // Amount in paise
            currency: bundle.currency,
            receipt: `receipt_${userId}_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save local Order record
        const order = await Order.create({
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

    } catch (error: any) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/orders/verify
// @access  Private
router.post('/verify', protect, async (req: any, res: Response) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const userId = req.user._id;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // 1. Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');

        if (generated_signature !== razorpaySignature) {
            // Mark order as failed? Or just return error.
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // 2. Find Order
        const order = await Order.findOne({ razorpayOrderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 3. Update Order Status
        order.status = 'paid';
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        await order.save();

        // 4. Grant Access to User
        const user = await User.findById(userId);
        if (user) {
            // Check if not already added (race condition check)
            const exists = user.purchasedBundles.some(
                (pb) => pb.bundleId.toString() === order.bundleId.toString()
            );
            if (!exists) {
                user.purchasedBundles.push({
                    bundleId: order.bundleId as any,
                    purchasedAt: new Date(),
                    orderId: razorpayOrderId,
                    paymentId: razorpayPaymentId,
                });
                await user.save();
            }
        }

        res.status(200).json({ success: true, message: 'Payment verified and bundle added' });

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
