import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import College from '@/lib/models/College';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Build filter query
        const filterQuery: any = {};

        // Type filtering (india, international)
        const type = searchParams.get('type');
        if (type === 'india') {
            filterQuery.country = 'India';
            filterQuery.isNewGen = { $ne: true };
        } else if (type === 'international') {
            filterQuery.country = { $ne: 'India' };
        }

        // State filtering
        const state = searchParams.get('state');
        if (state) {
            filterQuery['location.state'] = state;
        }

        // Exam filtering
        const exam = searchParams.get('exam');
        if (exam) {
            filterQuery['exams_required'] = exam;
        }

        // Budget range
        const minFees = searchParams.get('minFees');
        const maxFees = searchParams.get('maxFees');
        if (minFees || maxFees) {
            filterQuery.fees = {};
            if (minFees) filterQuery.fees.$gte = Number(minFees);
            if (maxFees) filterQuery.fees.$lte = Number(maxFees);
        }

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

        // Sorting
        const sortParam = searchParams.get('sort');
        const sortBy = sortParam ? sortParam.split(',').join(' ') : '-restart_score';

        // Execute queries
        const total = await College.countDocuments(filterQuery);
        const colleges = await College.find(filterQuery)
            .sort(sortBy)
            .skip(startIndex)
            .limit(limit);

        // Pagination result
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
        console.error('[Get Colleges Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get colleges' },
            { status: 500 }
        );
    }
}
