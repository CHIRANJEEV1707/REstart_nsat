import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';
import { getUserFromToken } from '@/lib/auth-utils';

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

        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType');
        const slug = searchParams.get('slug');

        const query: Record<string, any> = {
            isActive: true,
            isPYQ: false,
        };

        if (slug) {
            query.slug = slug;
        } else if (examType) {
            query.examType = examType;
        }

        const tests = await MockTest.find(query)
            .select('title slug description examType duration totalMarks sections isFree isPremium difficulty requiredBundle testCategory order')
            .sort({ order: 1, createdAt: 1 })
            .lean();

        const testsWithCount = tests.map(t => ({
            ...t,
            questionCount: t.sections?.reduce((sum: number, s: any) => sum + (s.questionCount || 0), 0) ?? 0,
        }));

        return NextResponse.json({
            success: true,
            data: testsWithCount,
        });
    } catch (error: any) {
        console.error('[Mock Tests Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch mock tests' },
            { status: 500 }
        );
    }
}
