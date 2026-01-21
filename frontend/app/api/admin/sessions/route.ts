import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SessionBooking from '@/lib/models/SessionBooking';
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
            query.status = status;
        }

        const bookings = await SessionBooking.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');

        return NextResponse.json({ success: true, count: bookings.length, data: bookings });

    } catch (error) {
        console.error('Admin Sessions Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch sessions' }, { status: 500 });
    }
}
