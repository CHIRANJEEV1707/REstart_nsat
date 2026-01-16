import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bundle from '@/lib/models/Bundle';
import Order from '@/lib/models/Order';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';

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
        const { bundleId } = body;

        if (!bundleId) {
            return NextResponse.json(
                { success: false, message: 'Bundle ID is required' },
                { status: 400 }
            );
        }

        // Find bundle
        const bundle = await Bundle.findById(bundleId);
        if (!bundle) {
            return NextResponse.json(
                { success: false, message: 'Bundle not found' },
                { status: 404 }
            );
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: bundle.price * 100, // Convert to paise
            currency: bundle.currency || 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                bundleId: bundle._id.toString(),
                userId: userId,
            }
        });

        // Save order in database
        const order = await Order.create({
            userId,
            bundleId: bundle._id,
            razorpayOrderId: razorpayOrder.id,
            amount: bundle.price,
            currency: bundle.currency || 'INR',
            status: 'created'
        });

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            bundle: {
                title: bundle.title,
                description: bundle.description
            }
        });
    } catch (error: any) {
        console.error('[Create Order Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
