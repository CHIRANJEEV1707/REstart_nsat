import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import College from '@/lib/models/College';
import NewGenCollege from '@/lib/models/NewGenCollege';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

interface NormalizedCollege {
    _id: any;
    name: string;
    fees: number;
    country: string;
    restart_score: number;
    exams_required: string[];
    isNewGen: boolean;
    isTrending: boolean;
    image?: string;
    location?: { city: string; state: string };
    type?: string;
    matchPercentage?: number;
    why?: string[];
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

        const user = await User.findById(userId);

        // Handle new user / incomplete profile
        if (!user || !user.preferences) {
            return NextResponse.json({
                success: true,
                topMatches: [],
                meta: { avgMatch: 0, budgetMatch: false, locationMatch: false }
            });
        }

        const prefs = user.preferences;
        const budgetMax = prefs.budget?.amount || 10000000;
        const preferredCountries = prefs.preferredCountries || ['India'];
        const examsGiven = prefs.examScores?.map((e: any) => e.exam) || user.target_exams || [];
        const collegeTypePreference = prefs.collegeTypePreference || 'neutral';

        // Weights for scoring
        const W_BUDGET = 0.35;
        const W_RESTART = 0.30;
        const W_EXAM = 0.20;
        const W_LOCATION = 0.15;

        let candidates: NormalizedCollege[] = [];

        // Fetch Indian colleges
        const wantIndian = preferredCountries.includes('India');
        if (wantIndian) {
            const colleges = await College.find({
                country: 'India',
                isNewGen: { $ne: true },
                fees: { $lte: budgetMax * 1.5 }
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type').limit(50).lean();
            candidates.push(...(colleges as any));
        }

        // Fetch international if wanted
        const wantInternational = preferredCountries.some(c => c !== 'India');
        if (wantInternational) {
            const foreignCountries = preferredCountries.filter(c => c !== 'India');
            const countryFilter = foreignCountries.length > 0 ? { $in: foreignCountries } : { $ne: 'India' };
            const colleges = await College.find({
                country: countryFilter,
                fees: { $lte: budgetMax * 1.5 }
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type').limit(30).lean();
            candidates.push(...(colleges as any));
        }

        // Fetch New Gen if preference allows
        if (collegeTypePreference !== 'prefer_traditional') {
            const colleges = await NewGenCollege.find({ 'fees.amountINR': { $lte: budgetMax * 1.5 } }).limit(20).lean();
            const normalizedNewGen = colleges.map((c: any) => ({
                _id: c._id,
                name: c.name,
                fees: c.fees?.amountINR || 0,
                country: c.location?.country || 'India',
                restart_score: 8.5,
                exams_required: c.examsAccepted || [],
                isNewGen: true,
                isTrending: c.isTrending,
                image: c.image,
                location: c.location,
                type: 'New-Gen'
            }));
            candidates.push(...normalizedNewGen);
        }

        // Score candidates
        const scoredCandidates = candidates.map(college => {
            if (!college.name) return null;

            let budgetScore = 0;
            let examScore = 0;
            let restartScoreVal = 0;
            let locationScore = 0;
            const reasons: string[] = [];

            // Budget scoring
            if (college.fees <= budgetMax) {
                budgetScore = 100;
                reasons.push("Within Budget");
            } else if (college.fees <= budgetMax * 1.20) {
                budgetScore = 50;
            }

            // Exam scoring
            const required = Array.isArray(college.exams_required) ? college.exams_required : [];
            if (required.length === 0) {
                examScore = 100;
            } else {
                const hasOverlap = required.some(ex =>
                    examsGiven.some((uEx: string) => uEx.toLowerCase() === ex.toLowerCase())
                );
                examScore = hasOverlap ? 100 : 0;
                if (hasOverlap) reasons.push("Exam Match");
            }

            // Restart score
            restartScoreVal = ((college.restart_score || 0) / 10) * 100;
            if (college.isNewGen && collegeTypePreference === 'prefer_new_gen') {
                restartScoreVal = Math.min(restartScoreVal * 1.20, 100);
                reasons.push("New-Gen Fit");
            }
            if ((college.restart_score || 0) >= 8.5) {
                reasons.push("High Score");
            }

            // Location scoring
            if (preferredCountries.includes(college.country)) {
                locationScore = 100;
                if (college.country !== 'India') reasons.push("Country Match");
            }

            const totalScore = (
                (budgetScore * W_BUDGET) +
                (examScore * W_EXAM) +
                (restartScoreVal * W_RESTART) +
                (locationScore * W_LOCATION)
            );

            return {
                ...college,
                matchPercentage: Math.round(totalScore),
                why: [...new Set(reasons)].slice(0, 3)
            };
        }).filter(Boolean) as NormalizedCollege[];

        // Sort and dedupe
        scoredCandidates.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

        const cityMap = new Set<string>();
        const finalMatches: any[] = [];

        for (const c of scoredCandidates) {
            const city = c.location?.city || 'Unknown';
            if (!cityMap.has(city) || city === 'Unknown') {
                if (city !== 'Unknown') cityMap.add(city);
                finalMatches.push(c);
            }
            if (finalMatches.length >= 6) break;
        }

        // Meta stats
        const avgMatch = finalMatches.length > 0
            ? Math.round(finalMatches.reduce((acc, c) => acc + (c.matchPercentage || 0), 0) / finalMatches.length)
            : 0;

        const budgetMatch = finalMatches.some(c => c.fees <= budgetMax);
        const locationMatch = finalMatches.some(c => preferredCountries.includes(c.country));

        return NextResponse.json({
            success: true,
            topMatches: finalMatches,
            meta: {
                avgMatch,
                budgetMatch,
                locationMatch
            }
        });
    } catch (error: any) {
        console.error('[Recommendations Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}
