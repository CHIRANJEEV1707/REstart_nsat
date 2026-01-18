import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TestAttempt from '@/lib/models/TestAttempt';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

async function getUser(request: NextRequest) {
    let token: string | undefined;

    // Try cookies first
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;

    // Fallback to Authorization header
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
    await dbConnect();
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { attemptId } = await params;
        const { type } = await request.json();

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: user._id,
            status: 'in-progress'
        });

        if (!attempt) {
            return NextResponse.json({ success: false, message: 'Attempt not found' }, { status: 404 });
        }

        // Add violation
        attempt.violations.push({ type, timestamp: new Date() });
        attempt.totalViolations = (attempt.totalViolations || 0) + 1;

        // Update summary
        if (!attempt.proctoringSummary) attempt.proctoringSummary = { tabSwitches: 0, fullscreenExits: 0, windowBlurs: 0 };

        if (type === 'tab_switch' || type === 'tab_change') attempt.proctoringSummary.tabSwitches += 1; // Frontend sends 'tab_change' sometimes? 'tab_switch' in backend. Frontend component says 'tab_change' in Warning? 
        if (type === 'fullscreen_exit') attempt.proctoringSummary.fullscreenExits += 1;
        if (type === 'window_blur') attempt.proctoringSummary.windowBlurs += 1;

        await attempt.save();

        return NextResponse.json({ success: true, totalViolations: attempt.totalViolations });
    } catch (error: any) {
        console.error('[Violation Error]', error);
        return NextResponse.json({ success: false, message: 'Failed to record violation' }, { status: 500 });
    }
}
