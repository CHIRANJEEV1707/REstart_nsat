import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import College from '@/lib/models/College';
import InternationalCollege from '@/lib/models/InternationalCollege';
import NewGenCollege from '@/lib/models/NewGenCollege';
import { getUserFromToken } from '@/lib/auth-utils';

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

