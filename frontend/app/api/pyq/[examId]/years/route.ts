import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';

export async function GET(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    await dbConnect();
    const { examId } = await params;

    try {
        // Find all PYQs for this exam
        const pyqs = await MockTest.find({
            examType: examId,
            isPYQ: true,
            isActive: true
        }).sort({ year: -1, order: 1 });

        // Group by year
        const groupedByYear: { [key: number]: any[] } = {};

        pyqs.forEach(pyq => {
            const year = pyq.year || new Date(pyq.createdAt).getFullYear();
            if (!groupedByYear[year]) {
                groupedByYear[year] = [];
            }
            groupedByYear[year].push({
                _id: pyq._id,
                title: pyq.title,
                slug: pyq.slug,
                shift: pyq.shift,
                questionCount: pyq.sections.reduce((acc, sec) => acc + sec.questionCount, 0),
                totalMarks: pyq.totalMarks,
                duration: pyq.duration
            });
        });

        return NextResponse.json({
            success: true,
            data: groupedByYear
        });
    } catch (error) {
        console.error('[PYQ Years API] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch PYQs' }, { status: 500 });
    }
}
