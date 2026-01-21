
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import jwt from 'jsonwebtoken';

import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();


        // Simple Password Check
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== (process.env.ADMIN_PASSWORD || 'admin123')) {
            return NextResponse.json({ success: false, message: 'Invalid Admin Password' }, { status: 401 });
        }


        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query: any = {};
        if (status) {
            query.verificationStatus = status;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'name email');

        return NextResponse.json({ success: true, count: orders.length, data: orders });

    } catch (error) {
        console.error('Admin Orders Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
    }
}
