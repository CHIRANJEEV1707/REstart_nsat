import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Exam from '@/lib/models/Exam';
import jwt from 'jsonwebtoken';

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

        const user = await User.findById(userId)
            .populate('saved_colleges')
            .populate('saved_international_colleges')
            .populate('saved_newgen_colleges');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Get upcoming exam deadlines
        const today = new Date();
        let upcomingExams;

        if (user.target_exams && user.target_exams.length > 0) {
            // Prioritize tracked exams
            upcomingExams = await Exam.find({
                _id: { $in: user.target_exams },
                $or: [
                    { 'dates.registration_end': { $gte: today } },
                    { 'dates.exam_date_start': { $gte: today } }
                ]
            }).sort('dates.registration_end');
        } else {
            // Fallback to general upcoming exams
            upcomingExams = await Exam.find({
                $or: [
                    { 'dates.registration_end': { $gte: today } },
                    { 'dates.exam_date_start': { $gte: today } }
                ]
            }).sort('dates.registration_end').limit(5);
        }

        // Format deadlines
        const deadlines = upcomingExams.map(exam => ({
            _id: exam._id,
            title: exam.name,
            date: exam.dates?.registration_end || exam.dates?.exam_date_start,
            type: exam.dates?.registration_end ? 'registration' : 'exam',
            url: exam.website
        }));

        // Combine saved colleges
        const saved_colleges = [
            ...(user.saved_colleges || []).map((c: any) => ({ ...c.toObject?.() || c, type: 'indian' })),
            ...(user.saved_international_colleges || []).map((c: any) => ({ ...c.toObject?.() || c, type: 'international' })),
            ...(user.saved_newgen_colleges || []).map((c: any) => ({ ...c.toObject?.() || c, type: 'newgen' }))
        ];

        // Dashboard data matching frontend expectations
        const dashboardData = {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted,
                preferences: user.preferences
            },
            saved_colleges,
            deadlines,
            purchasedBundles: user.purchasedBundles || []
        };

        return NextResponse.json({
            success: true,
            data: dashboardData
        });
    } catch (error: any) {
        console.error('[Dashboard Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get dashboard' },
            { status: 500 }
        );
    }
}
