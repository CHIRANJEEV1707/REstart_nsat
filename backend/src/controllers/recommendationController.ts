import { Request, Response } from 'express';
import College from '../models/College';
import NewGenCollege from '../models/NewGenCollege';
import User, { IUser } from '../models/User';
import logger from '../utils/logger';

// Helper interface for normalized college object
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
    // Computed fields
    matchPercentage?: number; // Renamed from fitScore
    why?: string[];          // Renamed from allReasons
    matchReason?: string;
}

// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
export const getDashboardRecommendations = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId);

        // Strict Requirement: Handle new user / incomplete profile
        if (!user || !user.preferences) {
            return res.status(200).json({
                topMatches: [],
                meta: { avgMatch: 0, budgetMatch: false, locationMatch: false }
            });
        }

        const prefs = user.preferences;
        const budgetRange = prefs.budgetINR || { min: 0, max: 10000000 };
        const budgetMax = budgetRange.max;
        const preferredCountries = prefs.preferredCountries || ['India'];
        const interestedExams = [...(prefs.interestedExams || []), ...(prefs.examScores?.map(e => e.exam) || [])];
        const userState = user.profile?.state || user.state;
        const userCountry = user.profile?.country || user.country || 'India';

        // Weights (System defaults as user model doesn't have custom weights yet)
        const W_BUDGET = 0.35;
        const W_RESTART = 0.30;
        const W_EXAM = 0.20;
        const W_LOCATION = 0.15;

        // Fetch Candidates (Unchanged logic for gathering pool - we filter STRICTLY later)
        const wantNewGen = prefs.newGenInterest || prefs.aspiringCollegeType?.includes('New-Gen');
        const wantInternational = preferredCountries.some(c => c !== 'India');
        const wantIndian = preferredCountries.includes('India');

        let candidates: NormalizedCollege[] = [];

        if (wantIndian) {
            const colleges = await College.find({
                country: 'India',
                isNewGen: { $ne: true },
                // Slight pre-filter to avoid fetching unlikely matches, but true filter is below
                fees: { $lte: budgetMax * 1.2 }
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type');
            candidates.push(...colleges as any);
        }

        if (wantInternational) {
            const foreignCountries = preferredCountries.filter(c => c !== 'India');
            const countryFilter = foreignCountries.length > 0 ? { $in: foreignCountries } : { $ne: 'India' };
            const colleges = await College.find({
                country: countryFilter,
                fees: { $lte: budgetMax * 1.2 }
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type');
            candidates.push(...colleges as any);
        }

        if (wantNewGen) {
            const colleges = await NewGenCollege.find({ 'fees.amountINR': { $lte: budgetMax * 1.2 } });
            const normalizedNewGen = colleges.map(c => ({
                _id: c._id,
                name: c.name,
                fees: c.fees.amountINR,
                country: c.location.country,
                restart_score: 8.5,
                exams_required: c.examsAccepted || [],
                isNewGen: true,
                isTrending: c.isTrending,
                image: c.image,
                location: c.location,
                type: 'New-Gen'
            }));
            candidates.push(...normalizedNewGen as any);
        }

        // 2. Score & Filter Candidates
        const scoredCandidates = candidates.map(college => {
            // Data Integrity Check (Strict Rule: "If any field is missing -> exclude")
            if (!college.image || !college.location?.city || !college.location?.state) {
                return null;
            }

            let budgetScore = 0;
            let examScore = 0;
            let restartScoreVal = 0;
            let locationScore = 0;
            const reasons: string[] = [];

            // A. Budget Scoring
            if (college.fees <= budgetMax) {
                budgetScore = 100;
            } else if (college.fees <= budgetMax * 1.10) {
                budgetScore = 70; // Within 10% buffer
            } else {
                budgetScore = 0;
            }
            if (budgetScore >= 90) reasons.push("Perfect Budget Fit");

            // B. Exam Scoring
            const required = college.exams_required || [];
            if (required.length === 0) {
                // Or should this be 0? Prompt says: "Any overlap -> 100, None -> 0". 
                // If no exams required, it technically "overlaps" with availability? 
                // Let's assume if college requires NONE, it's accessible -> 100.
                examScore = 100;
            } else {
                const hasOverlap = required.some(ex => interestedExams.some(uEx => uEx.toLowerCase() === ex.toLowerCase()));
                examScore = hasOverlap ? 100 : 0;
            }
            if (examScore === 100) reasons.push("Exam Match");

            // C. Restart Score
            // Normalize restart_score / 10 * 100
            restartScoreVal = ((college.restart_score || 0) / 10) * 100;
            if ((college.restart_score || 0) >= 9.0) reasons.push("High Restart Score");

            // D. Location Scoring
            const collegeState = college.location.state;
            const collegeCountry = college.country;

            if (collegeState && userState && collegeState.toLowerCase() === userState.toLowerCase()) {
                locationScore = 100;
                reasons.push("Location Match");
            } else if (collegeCountry && userCountry && collegeCountry.toLowerCase() === userCountry.toLowerCase()) {
                locationScore = 60;
                // If it's 60, does it get a tag? Prompt: "if (locationScore >= 60) why.push...". Yes.
                reasons.push("Location Match");
            } else {
                locationScore = 0;
            }

            // TOTAL SCORE
            const totalScore = (
                (budgetScore * W_BUDGET) +
                (examScore * W_EXAM) +
                (restartScoreVal * W_RESTART) +
                (locationScore * W_LOCATION)
            );

            // REJECT if < 70
            if (totalScore < 70) return null;

            return {
                ...college,
                matchPercentage: Math.round(totalScore),
                why: reasons.slice(0, 4), // Max 4 tags
                location: college.location
            };
        }).filter(Boolean) as NormalizedCollege[]; // Filter out nulls

        // 3. Sort & Diversity
        scoredCandidates.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

        // Rule: Max 1 college per city AND Unique Images
        const cityMap = new Set<string>();
        const imageMap = new Set<string>();
        const finalMatches: any[] = [];

        for (const c of scoredCandidates) {
            const city = c.location?.city || 'Unknown';
            const img = c.image || '';

            // Check City Uniqueness
            const isCityUnique = !cityMap.has(city) || city === 'Unknown';
            // Check Image Uniqueness (if image exists)
            const isImageUnique = !img || !imageMap.has(img);

            if (isCityUnique && isImageUnique) {
                if (city !== 'Unknown') cityMap.add(city);
                if (img) imageMap.add(img);
                finalMatches.push(c);
            }
            if (finalMatches.length >= 6) break;
        }

        const topMatches = finalMatches;

        // 4. Meta Stats
        const avgMatch = topMatches.length > 0
            ? Math.round(topMatches.reduce((acc, c) => acc + (c.matchPercentage || 0), 0) / topMatches.length)
            : 0;

        const budgetMatch = topMatches.some(c => c.fees <= budgetMax);
        const locationMatch = topMatches.some(c => c.location?.state === userState || c.country === userCountry);

        res.status(200).json({
            topMatches, // Strict JSON shape
            meta: {
                avgMatch,
                budgetMatch,
                locationMatch
            }
        });

    } catch (error) {
        logger.error('Error fetching dashboard recommendations:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
