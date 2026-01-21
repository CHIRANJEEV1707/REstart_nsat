import express, { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth';
import SessionBooking from '../models/SessionBooking';

const router = express.Router();

// Session pricing
const SESSION_PRICES = {
    'interview-prep': 10000, // ₹100 in paise
    'restart-unfiltered': 20000 // ₹200 in paise
};

// Calendly URLs (set in .env)
const CALENDLY_URLS = {
    'interview-prep': process.env.CALENDLY_INTERVIEW_URL || 'https://calendly.com/letsrestart-here/interview-prep',
    'restart-unfiltered': process.env.CALENDLY_UNFILTERED_URL || 'https://calendly.com/letsrestart-here/restart-unfiltered'
};

// Lazy Razorpay initialization
let razorpayInstance: Razorpay | null = null;
const getRazorpay = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || ''
        });
    }
    return razorpayInstance;
};

// @desc    Create order for session booking
// @route   POST /api/sessions/create-order
// @access  Private
router.post('/create-order', protect, async (req: any, res: Response) => {
    try {
        const { sessionType } = req.body;

        console.log('[Session] Create Order Request:', { sessionType, user: req.user?.email });

        if (!SESSION_PRICES[sessionType as keyof typeof SESSION_PRICES]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session type'
            });
        }

        const amount = SESSION_PRICES[sessionType as keyof typeof SESSION_PRICES];

        // Check Razorpay credentials
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('[Session] Missing Razorpay credentials');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway not configured'
            });
        }

        // Create Razorpay order
        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `session_${Date.now()}`,
            notes: {
                sessionType,
                userId: req.user._id.toString(),
                userEmail: req.user.email
            }
        });

        console.log('[Session] Order created:', order.id);

        // Create or Update booking record (status: pending until payment verified)
        // Reusing existing 'pending' booking to avoid duplicates
        await SessionBooking.findOneAndUpdate(
            { userId: req.user._id, sessionType, status: 'pending' },
            {
                amount: amount / 100,
                orderId: order.id,
                userEmail: req.user.email,
                userName: req.user.name,
                paymentId: '', // Reset if reused from a failed attempt
                paymentMethod: 'razorpay'
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount,
                currency: 'INR',
                bookingId: booking._id,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error: any) {
        console.error('[Session Create Order Error]', error.message || error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
});

// @desc    Verify payment and return Calendly URL
// @route   POST /api/sessions/verify-payment
// @access  Private
router.post('/verify-payment', protect, async (req: any, res: Response) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        // Verify signature
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update booking
        const booking = await SessionBooking.findOne({ orderId });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Build Calendly URL with prefilled info
        const baseUrl = CALENDLY_URLS[booking.sessionType as keyof typeof CALENDLY_URLS];
        const calendlyUrl = `${baseUrl}?name=${encodeURIComponent(booking.userName)}&email=${encodeURIComponent(booking.userEmail)}`;

        booking.paymentId = paymentId;
        booking.calendlyUrl = calendlyUrl;
        booking.status = 'paid';
        await booking.save();

        res.json({
            success: true,
            data: {
                bookingId: booking._id,
                calendlyUrl,
                message: 'Payment verified! Redirecting to schedule your session.'
            }
        });
    } catch (error: any) {
        console.error('[Session Verify Payment Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
        });
    }
});

// @desc    Get user's session bookings
// @route   GET /api/sessions/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req: any, res: Response) => {
    try {
        const bookings = await SessionBooking.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error: any) {
        console.error('[Session Get Bookings Error]', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

export default router;
