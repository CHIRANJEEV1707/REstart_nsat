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

        // Exam filtering (support both 'exam' and 'examType')
        const exam = searchParams.get('exam') || searchParams.get('examType');
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
        // Increase limit if examType is present (for modal view), or default to 12
        // But better to let client decide.
        // My CollegeListModal logic didn't pass pagination, so it gets 12.
        // It should probably show more or have pagination.
        // For now, if examType is passed, maybe we want more results?
        // Let's keep 12 default but allow override.
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Sorting
        // If examType is specific, we might want trendingScore.
        // The previous default was -restart_score.
        const sortParam = searchParams.get('sort');
        let sortBy = sortParam ? sortParam.split(',').join(' ') : '-restart_score';

        if (!sortParam && (searchParams.get('examType') || searchParams.get('exam'))) {
            sortBy = '-trendingScore';
        }

        // Execute queries
        const total = await College.countDocuments(filterQuery);
        const colleges = await College.find(filterQuery)
            .sort(sortBy)
            .skip(startIndex)
            .limit(limit)
            .lean(); // Added lean for performance

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
