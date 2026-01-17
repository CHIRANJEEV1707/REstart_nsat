import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewGuide from '@/lib/models/InterviewGuide';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const guideType = searchParams.get('guideType');

        const filter: any = { isActive: true };
        if (guideType) filter.guideType = guideType;

        const guides = await InterviewGuide.find(filter)
            .select('title slug guideType description isFree order')
            .sort({ order: 1 });

        return NextResponse.json({
            success: true,
            count: guides.length,
            data: guides
        });
    } catch (error: any) {
        console.error('[Interview Guides List Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch guides' },
            { status: 500 }
        );
    }
}
