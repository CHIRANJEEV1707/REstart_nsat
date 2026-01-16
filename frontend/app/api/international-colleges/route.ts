import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InternationalCollege from '@/lib/models/InternationalCollege';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        const filterQuery: any = {};

        // Country filtering
        const country = searchParams.get('country');
        if (country) {
            const countries = country.split(',');
            filterQuery.country = { $in: countries };
        }

        // Budget range
        const minFees = searchParams.get('minFees');
        const maxFees = searchParams.get('maxFees');
        if (minFees || maxFees) {
            filterQuery.tuition_fee_annual = {};
            if (minFees) filterQuery.tuition_fee_annual.$gte = Number(minFees);
            if (maxFees) filterQuery.tuition_fee_annual.$lte = Number(maxFees);
        }

        // Text search
        const search = searchParams.get('search');
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filterQuery.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { country: searchRegex }
            ];
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = await InternationalCollege.countDocuments(filterQuery);
        const colleges = await InternationalCollege.find(filterQuery)
            .sort({ restart_score: -1 })
            .skip(startIndex)
            .limit(limit);

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
        console.error('[Get International Colleges Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get international colleges' },
            { status: 500 }
        );
    }
}
