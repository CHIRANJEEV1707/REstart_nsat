import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return NextResponse.json({ success: false, message: 'Server config error' }, { status: 500 });

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
        }

        // Find and Update Order
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

        if (order.status === 'paid') {
            return NextResponse.json({ success: true, message: 'Already paid' });
        }

        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentMethod = 'razorpay';
        await order.save();

        // Grant Access to User
        const user = await User.findById(order.userId);
        if (user) {
            // Check if already purchased
            const alreadyPurchased = user.purchasedBundles.some(
                (b) => (b.orderId === razorpay_order_id) || (b.productSlug && b.productSlug === order.productSlug)
            );

            if (!alreadyPurchased) {
                user.purchasedBundles.push({
                    productSlug: order.productSlug,
                    bundleId: order.bundleId,
                    purchasedAt: new Date(),
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                });
                await user.save();
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified and access granted' });

    } catch (error) {
        console.error('Payment verification failed:', error);
        return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
    }
}
