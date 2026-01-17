import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/lib/models/Exam';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = {};
        if (search) {
            query = { name: { $regex: search, $options: 'i' } };
        }

        const exams = await Exam.find(query);

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
