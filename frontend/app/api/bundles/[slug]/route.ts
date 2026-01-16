import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bundle from '@/lib/models/Bundle';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();

        const { slug } = await params;

        const bundle = await Bundle.findOne({ slug, isActive: true });

        if (!bundle) {
            return NextResponse.json(
                { success: false, message: 'Bundle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: bundle
        });
    } catch (error: any) {
        console.error('[Get Bundle Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get bundle' },
            { status: 500 }
        );
    }
}
