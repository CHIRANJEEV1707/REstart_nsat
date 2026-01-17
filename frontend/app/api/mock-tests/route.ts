import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType');

        const filter: any = { isActive: true };
        if (examType) filter.examType = examType;

        const tests = await MockTest.find(filter)
            .select('title slug description examType duration totalMarks sections isFree isPremium difficulty order')
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: tests.length,
            data: tests
        });
    } catch (error: any) {
        console.error('[MockTest List Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch mock tests' },
            { status: 500 }
        );
    }
}
