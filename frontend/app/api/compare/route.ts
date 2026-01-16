import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import College from '@/lib/models/College';
import InternationalCollege from '@/lib/models/InternationalCollege';
import NewGenCollege from '@/lib/models/NewGenCollege';
import mongoose from 'mongoose';

// Helper functions to normalize college data for comparison
const normalizeIndianCollege = (col: any) => ({
    _id: col._id,
    name: col.name,
    type: 'indian',
    location: `${col.location?.city || ''}, ${col.location?.state || ''}`,
    ranking: `#${col?.restart_score || 0}/10 REstart Score`,
    fees: `₹${(col.fees || 0).toLocaleString()}/yr`,
    exams: (col.exams_required || []).join(', '),
    highlights: (col.badges || []).slice(0, 3),
    website: col.website,
    institute_type: col.type,
    restart_score: col.restart_score
});

const normalizeNewGenCollege = (col: any) => ({
    _id: col._id,
    name: col.name,
    type: 'newgen',
    location: `${col.location?.city || ''}, ${col.location?.state || ''}`,
    ranking: `#${col?.trendingScore || 0}/10 REstart Score`,
    fees: `₹${(col.fees?.amountINR || 0).toLocaleString()}/yr`,
    exams: (col.examsAccepted || []).join(', '),
    highlights: (col.highlights || []).slice(0, 3),
    website: col.website,
    institute_type: 'New-Gen Tech School',
    restart_score: col.trendingScore
});

const normalizeInternationalCollege = (col: any) => ({
    _id: col._id,
    name: col.name,
    type: 'international',
    location: `${col.city || col.location?.city || ''}, ${col.country || col.location?.country || ''}`,
    ranking: `#${col?.restart_score || 0}/10 REstart Score`,
    fees: `$${(col.tuition_fee_annual || col.fees || 0).toLocaleString()}/yr`,
    exams: [
        ...(col.entrance_exams || col.exams_required || []),
        ...(col.english_tests || []).map((t: string) => `${t} (min ${col.minimum_scores?.[t.toLowerCase()] || '-'})`)
    ].join(', '),
    highlights: (col.badges || []).slice(0, 3),
    website: col.official_website || col.website,
    institute_type: col.university_type || col.type,
    restart_score: col.restart_score
});

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { colleges } = body;

        if (!colleges || !Array.isArray(colleges) || colleges.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No colleges selected' },
                { status: 400 }
            );
        }

        // Consolidate "traditional" colleges (Indian & International) into one query target
        // Logic: Both Indian and International colleges reside in the 'College' collection.
        // Only 'NewGen' colleges are in a separate collection.
        const standardCollegeIds = colleges
            .filter((c: any) => {
                const t = (c.collegeType || c.type);
                return t === 'indian' || t === 'traditional' || t === 'international';
            })
            .map((c: any) => c.collegeId || c._id);

        const newGenIds = colleges
            .filter((c: any) => (c.collegeType || c.type) === 'newgen')
            .map((c: any) => c.collegeId || c._id);

        const getQuery = (ids: string[]) => {
            const objectIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
            const slugs = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));

            if (objectIds.length > 0 && slugs.length > 0) {
                return { $or: [{ _id: { $in: objectIds } }, { slug: { $in: slugs } }] };
            } else if (objectIds.length > 0) {
                return { _id: { $in: objectIds } };
            } else {
                return { slug: { $in: slugs } };
            }
        };

        const [standardColleges, newGenColleges] = await Promise.all([
            College.find(getQuery(standardCollegeIds)).lean(),
            NewGenCollege.find(getQuery(newGenIds)).lean()
        ]);

        // Normalize based on type found in DB or fallback to logic
        const normalizedStandard = standardColleges.map((col: any) => {
            // Determine if it looks international (country != India)
            if (col.country && col.country !== 'India') {
                return normalizeInternationalCollege(col);
            }
            return normalizeIndianCollege(col);
        });

        const normalizedNewGen = newGenColleges.map(normalizeNewGenCollege);

        const comparisonData = [...normalizedStandard, ...normalizedNewGen];

        return NextResponse.json({
            success: true,
            data: comparisonData
        });
    } catch (error: any) {
        console.error('[Compare Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to compare colleges' },
            { status: 500 }
        );
    }
}
