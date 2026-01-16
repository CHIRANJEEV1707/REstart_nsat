import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Exam from '@/lib/models/Exam';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

interface Alert {
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action?: string;
    actionUrl?: string;
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

// Generate alerts based on user profile and upcoming exams
function generateAlerts(user: any, upcomingExams: any[]): Alert[] {
    const alerts: Alert[] = [];
    const today = new Date();

    // Check for incomplete onboarding
    if (!user?.onboardingCompleted) {
        alerts.push({
            type: 'warning',
            title: 'Complete Your Profile',
            message: 'Finish setting up your preferences to get personalized college recommendations.',
            action: 'Complete Now',
            actionUrl: '/onboarding'
        });
    }

    // Check for exam deadlines
    for (const exam of upcomingExams) {
        const regEnd = exam.dates?.registration_end ? new Date(exam.dates.registration_end) : null;

        if (regEnd) {
            const daysUntil = Math.ceil((regEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil > 0 && daysUntil <= 7) {
                alerts.push({
                    type: 'warning',
                    title: `${exam.name} Registration Closing Soon!`,
                    message: `Only ${daysUntil} day(s) left to register for ${exam.name}.`,
                    action: 'Register Now',
                    actionUrl: exam.website || `/exams/${exam._id}`
                });
            } else if (daysUntil > 7 && daysUntil <= 14) {
                alerts.push({
                    type: 'info',
                    title: `${exam.name} Registration Open`,
                    message: `Registration closes in ${daysUntil} days.`,
                    action: 'View Details',
                    actionUrl: `/exams/${exam._id}`
                });
            }
        }
    }

    // Check for no saved colleges
    const savedCount = (user?.saved_colleges?.length || 0) +
        (user?.saved_international_colleges?.length || 0) +
        (user?.saved_newgen_colleges?.length || 0);

    if (savedCount === 0 && user?.onboardingCompleted) {
        alerts.push({
            type: 'info',
            title: 'Start Exploring Colleges',
            message: 'Save colleges you\'re interested in to compare them later.',
            action: 'Explore Now',
            actionUrl: '/explore'
        });
    }

    return alerts;
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);
        const today = new Date();

        // Fetch upcoming exams
        const upcomingExams = await Exam.find({
            $or: [
                { 'dates.registration_end': { $gte: today } },
                { 'dates.exam_date_start': { $gte: today } }
            ]
        }).sort('dates.registration_end');

        const alerts = generateAlerts(user, upcomingExams);

        return NextResponse.json({
            success: true,
            data: alerts
        });
    } catch (error: any) {
        console.error('[Alerts Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get alerts' },
            { status: 500 }
        );
    }
}
