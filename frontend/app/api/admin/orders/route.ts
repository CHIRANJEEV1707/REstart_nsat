
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import jwt from 'jsonwebtoken';

// Helper for Admin Auth (Basic check based on token role)
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

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        if (!await isAdmin(request)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
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
