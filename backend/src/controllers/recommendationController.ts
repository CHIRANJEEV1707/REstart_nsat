import { Request, Response } from 'express';
import User from '../models/User';
import College from '../models/College';
import NewGenCollege from '../models/NewGenCollege';
import InternationalCollege from '../models/InternationalCollege';

interface ScoredCollege {
    college: any;
    fitScore: number;
    reasons: string[];
    type: 'Traditional' | 'New-Gen' | 'International';
}

// @desc    Get personalized college recommendations
// @route   GET /api/colleges/recommendations
export const getRecommendations = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.preferences) {
            // Fallback: If no profile/preferences, return generic popular colleges
            // For now, let's just return top ranked/trending as a fallback
            return res.status(200).json({
                success: true,
                isGeneric: true,
                message: "Profile incomplete. Showing generic recommendations.",
                data: []
            });
        }

        const prefs = user.preferences;

        // 1. Fetch eligible colleges from all sources
        // Optimization: Apply Hard Filters at DB level if possible to reduce memory usage
        // But for "Type" preference, we fetch conditionally

        let promiseArr = [];
        const typesWanted = prefs.aspiringCollegeType || [];

        // Always fetch traditional if types not specified or includes 'Engineering'/'Traditional' etc
        // For simplicity, fetch all traditional unless explicitly excluded (logic can be refined)
        promiseArr.push(College.find().lean());

        // Fetch New-Gen if interested
        if (prefs.newGenInterest || typesWanted.includes('New-Gen')) {
            promiseArr.push(NewGenCollege.find().lean());
        }

        // Fetch International if desired
        if (prefs.preferredCountries && prefs.preferredCountries.some(c => c !== 'India')) {
            promiseArr.push(InternationalCollege.find().lean());
        }

        const predictions = await Promise.all(promiseArr);
        const allColleges = predictions.flat();

        // 2. Score Each College
        const scored: ScoredCollege[] = allColleges.map((col: any) => {
            let score = 0;
            const reasons: string[] = [];
            const isInternational = !!col.tuition_fee_annual; // loose check

            // --- A. Budget Match (30 pts) ---
            const annualFee = isInternational ? (col.tuition_fee_annual * 84) : (col.fees || col.amountINR || 0); // Convert USD approx if needed, or better handle currencies. Assuming user budgetUSD for international.

            // Logic: Compare against user budget
            // If isInternational, use budgetUSD. If Indian, use budgetINR.
            let budgetMax = 0;
            if (isInternational && prefs.budgetUSD) {
                budgetMax = prefs.budgetUSD.max * 84; // Convert to INR for standardized Score logic, usually international users think in lakhs too or dollar. 
                // Let's stick to matching currencies.
                const userMaxUSD = prefs.budgetUSD.max;
                if (col.tuition_fee_annual <= userMaxUSD) {
                    score += 30;
                    reasons.push("Within Budget");
                } else if (col.tuition_fee_annual <= userMaxUSD * 1.2) {
                    score += 15; // Slightly over
                }
            } else if (!isInternational && prefs.budgetINR) {
                budgetMax = prefs.budgetINR.max;
                if (annualFee <= budgetMax) {
                    score += 30;
                    reasons.push("Within Budget");
                } else if (annualFee <= budgetMax * 1.2) {
                    score += 15;
                }
            }

            // --- B. Country Match (25 pts) ---
            const collegeCountry = col.country || 'India';
            if (prefs.preferredCountries?.includes(collegeCountry)) {
                score += 25;
                reasons.push("Preferred Country");
            }

            // --- C. Exam Match (30 pts) ---
            // If user has taken an exam accepted by college
            const userExams = prefs.interestedExams || [];
            const userExamScores = prefs.examScores || [];

            // Normalize college exams (some use exams_required, examsAccepted, entrance_exams)
            const collegeExams: string[] = col.exams_required || col.examsAccepted || col.entrance_exams || [];

            const hasTakenExam = userExams.some(e => collegeExams.includes(e));
            if (hasTakenExam) {
                score += 30;
                reasons.push("Exam Match");
                // Bonus: if score cutoff known? (Leaving for V2)
            } else if (collegeExams.length === 0) {
                // No exams required?
                score += 10;
            }

            // --- D. Type/Category Match (15 pts) ---
            // Check based on model or fields
            let colType = 'Traditional';
            if (isInternational) colType = 'International';
            if (col.category === 'New-Gen') colType = 'New-Gen';

            if (typesWanted.includes(colType) || (colType === 'Traditional' && typesWanted.length === 0)) {
                score += 15;
            }

            return {
                college: col,
                fitScore: score,
                reasons: reasons,
                type: colType as any
            };
        });

        // 3. Sort & Filter
        // Filter out very low scores? e.g. < 30
        const topPicks = scored
            .filter(s => s.fitScore > 20)
            .sort((a, b) => b.fitScore - a.fitScore)
            .slice(0, 6);

        // 4. Normalize Response
        const responseData = topPicks.map(item => ({
            _id: item.college._id,
            name: item.college.name,
            image: item.college.image || '',
            location: item.college.location || { city: item.college.city, state: item.college.country },
            country: item.college.country || 'India',
            fitScore: item.fitScore,
            matchReason: item.reasons[0] || 'Good Fit', // Primary reason
            allReasons: item.reasons,
            type: item.type,
            fees: item.college.fees || item.college.tuition_fee_annual || item.college.amountINR
        }));

        // 5. Compute Meta for Hero Section
        const totalMatches = responseData.length;
        const avgFitScore = totalMatches > 0
            ? responseData.reduce((acc, curr) => acc + curr.fitScore, 0) / totalMatches
            : 0;

        const budgetMatched = responseData.some(r => r.allReasons.includes("Within Budget"));
        const locationMatched = responseData.some(r => r.allReasons.includes("Preferred Country"));

        let preferredCountry = "India";
        if (prefs.preferredCountries && prefs.preferredCountries.length > 0) {
            preferredCountry = prefs.preferredCountries.length === 1
                ? prefs.preferredCountries[0]
                : "your selected countries";
        }

        res.status(200).json({
            success: true,
            meta: {
                totalMatches,
                avgFitScore,
                budgetMatched,
                locationMatched,
                preferredCountry
            },
            data: responseData,
            recommendations: responseData
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
