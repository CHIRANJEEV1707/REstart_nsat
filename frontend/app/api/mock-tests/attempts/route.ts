import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import MockTest from '@/lib/models/MockTest'; // Ensure MockTest is registered

async function getUser(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getUser(request);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch completed attempts
        // Populate mockTest details (title)
        const attempts = await TestAttempt.find({
            userId: user._id,
            status: 'completed'
        })
            .sort({ completedAt: -1 }) // Newest first
            .populate('mockTestId', 'title totalMarks')
            .select('mockTestId totalScore maxScore analytics.accuracy completedAt totalTimeSpent');

        return NextResponse.json({
            success: true,
            data: attempts
        });
    } catch (error: any) {
        console.error('[Attempts History Error]', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch attempts' }, { status: 500 });
    }
}
