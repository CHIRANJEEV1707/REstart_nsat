import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import College from '@/lib/models/College';
import InternationalCollege from '@/lib/models/InternationalCollege';
import NewGenCollege from '@/lib/models/NewGenCollege';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decoded.id;
    } catch {
        return null;
    }
}

// GET - Get all saved colleges
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

        const user = await User.findById(userId)
            .populate('saved_colleges')
            .populate('saved_international_colleges')
            .populate('saved_newgen_colleges');

        if (!user) {
            return NextResponse.json({ success: true, count: 0, data: [] });
        }

        // Add type to each college object
        const indianColleges = (user.saved_colleges || []).map((c: any) => ({ ...c.toObject(), type: 'indian' }));
        const internationalColleges = (user.saved_international_colleges || []).map((c: any) => ({ ...c.toObject(), type: 'international' }));
        const newGenColleges = (user.saved_newgen_colleges || []).map((c: any) => ({ ...c.toObject(), type: 'newgen' }));

        const allSaved = [...indianColleges, ...internationalColleges, ...newGenColleges];

        const response = NextResponse.json({ success: true, count: allSaved.length, data: allSaved });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;
    } catch (error: any) {
        console.error('[Get Saved Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get saved colleges' },
            { status: 500 }
        );
    }
}

// POST - Toggle save/unsave college
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { collegeId, collegeType } = body;

        if (!collegeId) {
            return NextResponse.json(
                { success: false, message: 'College ID is required' },
                { status: 400 }
            );
        }

        const type = collegeType || 'indian';

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

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const targetArray = type === 'international' ? 'saved_international_colleges'
            : type === 'newgen' ? 'saved_newgen_colleges'
                : 'saved_colleges';

        const currentList = (user as any)[targetArray] || [];
        const isSaved = currentList.some((id: any) => id.toString() === collegeId);

        if (isSaved) {
            // Remove
            await User.updateOne(
                { _id: userId },
                { $pull: { [targetArray]: collegeId } }
            );
            return NextResponse.json({ success: true, saved: false, message: 'College removed' });
        } else {
            // Add
            await User.updateOne(
                { _id: userId },
                { $addToSet: { [targetArray]: collegeId } }
            );
            return NextResponse.json({ success: true, saved: true, message: 'College saved' });
        }
    } catch (error: any) {
        console.error('[Toggle Saved Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to toggle saved' },
            { status: 500 }
        );
    }
}

// DELETE - Remove saved college
export async function DELETE(request: NextRequest) {
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
        const collegeId = searchParams.get('id');
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
        console.error('[Remove Saved Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to remove saved' },
            { status: 500 }
        );
    }
}
