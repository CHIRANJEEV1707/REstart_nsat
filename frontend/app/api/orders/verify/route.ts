import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JwtPayload {
    id: string;
}

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        // Accept both camelCase (from frontend) and snake_case (from Razorpay)
        const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
        const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
        const razorpay_signature = body.razorpay_signature || body.razorpaySignature;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, message: 'Missing payment details' },
                { status: 400 }
            );
        }

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign)
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json(
                { success: false, message: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Find and update order
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'paid';
        await order.save();

        // Add bundle to user's purchased bundles
        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                purchasedBundles: {
                    bundleId: order.bundleId,
                    purchasedAt: new Date(),
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                orderId: order.razorpayOrderId,
                paymentId: order.razorpayPaymentId,
                bundleId: order.bundleId
            }
        });
    } catch (error: any) {
        console.error('[Verify Order Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
