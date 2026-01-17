import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import College from '@/lib/models/College';
import InternationalCollege from '@/lib/models/InternationalCollege';
import NewGenCollege from '@/lib/models/NewGenCollege';
import { getUserFromToken } from '@/lib/auth-utils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ collegeId: string }> }
) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { collegeId } = resolvedParams;
        const body = await request.json();
        const type = body.type || 'indian';

        if (!collegeId) {
            return NextResponse.json(
                { success: false, message: 'College ID is required' },
                { status: 400 }
            );
        }

        // Check if college exists
        let collegeExists = false;
        if (type === 'international') {
            const count = await InternationalCollege.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        } else if (type === 'newgen') {
            const count = await NewGenCollege.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        } else {
            const count = await College.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        }

        if (!collegeExists) {
            return NextResponse.json(
                { success: false, message: 'College not found' },
                { status: 404 }
            );
        }

        const targetArray = type === 'international' ? 'saved_international_colleges'
            : type === 'newgen' ? 'saved_newgen_colleges'
                : 'saved_colleges';

        await User.updateOne(
            { _id: userId },
            { $addToSet: { [targetArray]: collegeId } }
        );

        return NextResponse.json({ success: true, saved: true, message: 'College saved' });
    } catch (error: any) {
        console.error('[Save College Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to save college' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ collegeId: string }> }
) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { collegeId } = resolvedParams;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'indian';

        if (!collegeId) {
            return NextResponse.json(
                { success: false, message: 'College ID is required' },
                { status: 400 }
            );
        }

        const targetArray = type === 'international' ? 'saved_international_colleges'
            : type === 'newgen' ? 'saved_newgen_colleges'
                : 'saved_colleges';

        await User.updateOne(
            { _id: userId },
            { $pull: { [targetArray]: collegeId } }
        );

        return NextResponse.json({ success: true, saved: false, message: 'College removed' });
    } catch (error: any) {
        console.error('[Unsave College Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to remove saved college' },
            { status: 500 }
        );
    }
}
