import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/lib/models/Exam';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        const exam = await Exam.findById(id);

        if (!exam) {
            return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: exam
        });
    } catch (error: any) {
        console.error('[Get Single Exam Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get exam' },
            { status: 500 }
        );
    }
}
