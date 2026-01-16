import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bundle from '@/lib/models/Bundle';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const bundles = await Bundle.find({ isActive: true }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: bundles.length,
            data: bundles
        });
    } catch (error: any) {
        console.error('[Get Bundles Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get bundles' },
            { status: 500 }
        );
    }
}
