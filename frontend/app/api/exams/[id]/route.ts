import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Exam from '@/lib/models/Exam';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        let exam;
        // Check if id is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            exam = await Exam.findById(id).lean();
        }

        // If not found or not ObjectId, try by code (slug)
        if (!exam) {
            exam = await Exam.findOne({ code: id }).lean();
        }

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
