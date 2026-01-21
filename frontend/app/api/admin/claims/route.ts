import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Claim from '@/lib/models/Claim';

export async function GET(request: NextRequest) {
    try {
        // Admin Auth Check (Password based)
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch pending claims first
        const claims = await Claim.find().sort({ status: -1, createdAt: -1 }).populate('userId', 'email name');

        return NextResponse.json({
            success: true,
            data: claims
        });

    } catch (error: any) {
        console.error('[Admin Claims Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch claims' },
            { status: 500 }
        );
    }
}
