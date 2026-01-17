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

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const { examId } = await request.json();
        if (!examId) {
            return NextResponse.json({ success: false, message: 'Exam ID is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Add if not already exists
        if (!user.target_exams?.includes(examId)) {
            user.target_exams = [...(user.target_exams || []), examId];
            await user.save();
        }

        return NextResponse.json({ success: true, message: 'Exam tracked successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const { examId } = await request.json();
        if (!examId) {
            return NextResponse.json({ success: false, message: 'Exam ID is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        if (user.target_exams) {
            user.target_exams = user.target_exams.filter(id => id.toString() !== examId);
            await user.save();
        }

        return NextResponse.json({ success: true, message: 'Exam removed successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const trackedExams = await Exam.find({
            _id: { $in: user.target_exams }
        });

        return NextResponse.json({ success: true, data: trackedExams });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
