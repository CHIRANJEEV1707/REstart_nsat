import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQCategory from '@/lib/models/PYQCategory';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType');

        const filter: any = { isActive: true };
        if (examType) filter.examType = examType;

        const categories = await PYQCategory.find(filter)
            .sort({ year: -1, order: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error: any) {
        console.error('[PYQ Categories Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
