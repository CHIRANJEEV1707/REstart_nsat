
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Helper for Admin Auth
const isAdmin = async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
        return decoded.role === 'admin';
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        if (!await isAdmin(request)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, action } = await request.json(); // action: 'approve' | 'reject'

        if (!orderId || !action) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        if (action === 'approve') {
            order.status = 'success';
            order.verificationStatus = 'approved';
            await order.save();

            // Update User Bundle Status
            await User.findOneAndUpdate(
                { _id: order.userId, "purchasedBundles.orderId": order._id },
                {
                    $set: { "purchasedBundles.$.verificationStatus": "active" }
                }
            );
        } else if (action === 'reject') {
            order.status = 'failed';
            order.verificationStatus = 'rejected';
            await order.save();

            // Update User Bundle Status
            await User.findOneAndUpdate(
                { _id: order.userId, "purchasedBundles.orderId": order._id },
                {
                    $set: { "purchasedBundles.$.verificationStatus": "rejected" }
                }
            );
        }

        return NextResponse.json({ success: true, message: `Order ${action}ed` });

    } catch (error) {
        console.error('Admin Order Action Error:', error);
        return NextResponse.json({ success: false, message: 'Action failed' }, { status: 500 });
    }
}
