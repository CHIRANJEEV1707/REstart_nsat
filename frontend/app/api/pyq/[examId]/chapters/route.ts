import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/lib/models/Question';
import MockTest from '@/lib/models/MockTest';

export async function GET(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
    await dbConnect();
    const { examId } = await params;

    try {
        // 1. Get all PYQ IDs for this exam
        const pyqIds = await MockTest.find({
            examType: examId,
            isPYQ: true,
            isActive: true
        }).distinct('_id');

        if (pyqIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 2. Aggregate questions by Subject and Chapter
        const stats = await Question.aggregate([
            {
                $match: {
                    mockTestId: { $in: pyqIds },
                    subject: { $exists: true, $ne: '' },
                    chapter: { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: { subject: '$subject', chapter: '$chapter' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.subject',
                    chapters: {
                        $push: {
                            name: '$_id.chapter',
                            count: '$count'
                        }
                    },
                    totalQuestions: { $sum: '$count' }
                }
            },
            {
                $sort: { _id: 1 } // Sort by subject name
            }
        ]);

        return NextResponse.json({
            success: true,
            data: stats.map(s => ({
                subject: s._id,
                totalQuestions: s.totalQuestions,
                chapters: s.chapters.sort((a: any, b: any) => b.count - a.count) // Sort chapters by popularity
            }))
        });

    } catch (error) {
        console.error('[PYQ Statistics API] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch PYQ stats' }, { status: 500 });
    }
}
