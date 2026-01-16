import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewGenCollege from '@/lib/models/NewGenCollege';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        const filterQuery: any = {};

        // Text search
        const search = searchParams.get('search');
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filterQuery.$or = [
                { name: searchRegex },
                { 'location.city': searchRegex },
                { 'location.state': searchRegex }
            ];
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = await NewGenCollege.countDocuments(filterQuery);
        const colleges = await NewGenCollege.find(filterQuery)
            .sort({ trendingScore: -1 })
            .skip(startIndex)
            .limit(limit)
            .lean();

        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: startIndex > 0
        };

        return NextResponse.json({
            success: true,
            count: colleges.length,
            pagination,
            data: colleges
        });
    } catch (error: any) {
        console.error('[Get NewGen Colleges Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get newgen colleges' },
            { status: 500 }
        );
    }
}
