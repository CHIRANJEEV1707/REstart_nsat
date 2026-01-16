import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/lib/models/Exam';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const exams = await Exam.find();

        return NextResponse.json({
            success: true,
            count: exams.length,
            data: exams
        });
    } catch (error: any) {
        console.error('[Get Exams Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get exams' },
            { status: 500 }
        );
    }
}
