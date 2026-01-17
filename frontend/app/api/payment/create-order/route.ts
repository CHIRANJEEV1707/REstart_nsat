import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const { amount, currency = 'INR', receipt } = await req.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        // Return order details along with the Key ID so frontend can use it
        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}
