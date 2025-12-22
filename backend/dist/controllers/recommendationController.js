"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardRecommendations = void 0;
const College_1 = __importDefault(require("../models/College"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
// @desc    Get dashboard recommendations with strict shape
// @route   GET /api/recommendations/dashboard
const getDashboardRecommendations = async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = await User_1.default.findById(userId);
        // Strict Requirement: Handle new user / incomplete profile
        if (!user || !user.preferences) {
            return res.status(200).json({
                topMatches: [],
                meta: { avgMatch: 0, budgetMatch: false, locationMatch: false }
            });
        }
        const prefs = user.preferences;
        // Map new preferences to logic variables
        // Use budget from new schema, fallback to legacy
        const budgetMax = prefs.budget?.amount || prefs.budgetMax || 10000000;
        const preferredCountries = prefs.preferredCountries || ['India'];
        // Use exams from new schema (mapped to names), fallback to legacy top-level target_exams
        const examsGiven = prefs.examScores?.map(e => e.exam) || user.target_exams || [];
        // Use user profile state or legacy state
        const userState = user.profile?.state || user.state || 'Delhi'; // Fallback to avoid empty matches if unknown
        const userCountry = user.profile?.country || user.country || 'India';
        // Weights
        const W_BUDGET = 0.35;
        const W_RESTART = 0.30;
        const W_EXAM = 0.20;
        const W_LOCATION = 0.15;
        // Fetch Candidates...
        const wantNewGen = prefs.goal === 'BTech'; // simplified assumption or check other flags
        // Actually, let's keep the existing logic for fetching but update the Filtering/Scoring loop
        const collegeTypePreference = prefs.collegeTypePreference || 'neutral'; // 'prefer_new_gen', 'neutral', 'prefer_traditional'
        // 1. Fetch Candidates
        const wantInternational = preferredCountries.some(c => c !== 'India');
        const wantIndian = preferredCountries.includes('India');
        let candidates = [];
        if (wantIndian) {
            const colleges = await College_1.default.find({
                country: 'India',
                isNewGen: { $ne: true },
                fees: { $lte: budgetMax * 1.5 } // increased buffer for fetching
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type');
            candidates.push(...colleges);
        }
        if (wantInternational) {
            const foreignCountries = preferredCountries.filter(c => c !== 'India');
            const countryFilter = foreignCountries.length > 0 ? { $in: foreignCountries } : { $ne: 'India' };
            const colleges = await College_1.default.find({
                country: countryFilter,
                fees: { $lte: budgetMax * 1.5 }
            }).select('name fees country restart_score exams_required isNewGen isTrending image location type');
            candidates.push(...colleges);
        }
        // New Gen fetching logic
        // Strict Rule: If 'prefer_traditional', DO NOT fetch NewGen for dashboard (exclude from primary)
        // If 'prefer_new_gen' or 'neutral', DO fetch.
        if (collegeTypePreference !== 'prefer_traditional') {
            const colleges = await NewGenCollege_1.default.find({ 'fees.amountINR': { $lte: budgetMax * 1.5 } });
            const normalizedNewGen = colleges.map(c => {
                // Boost Logic: If prefer_new_gen, boost base score by 20% (approx +2 points on 10 scale or handled in scoring)
                // Let's boost raw score here slightly if needed or just flag it
                let baseScore = 8.5;
                return {
                    _id: c._id,
                    name: c.name,
                    fees: c.fees.amountINR,
                    country: c.location.country,
                    restart_score: baseScore,
                    exams_required: c.examsAccepted || [],
                    isNewGen: true,
                    isTrending: c.isTrending,
                    image: c.image,
                    location: c.location,
                    type: 'New-Gen'
                };
            });
            candidates.push(...normalizedNewGen);
        }
        // 2. Score & Filter Candidates
        const scoredCandidates = candidates.map(college => {
            // Data Integrity Check
            if (!college.image || !college.location?.city) {
                return null;
            }
            let budgetScore = 0;
            let examScore = 0;
            let restartScoreVal = 0;
            let locationScore = 0;
            const reasons = [];
            // A. Budget Scoring (35%)
            if (college.fees <= budgetMax) {
                budgetScore = 100;
            }
            else if (college.fees <= budgetMax * 1.20) {
                budgetScore = 50;
            }
            else {
                budgetScore = 0;
            }
            if (budgetScore === 100)
                reasons.push("Within Budget");
            // B. Exam Scoring (20%)
            const required = college.exams_required || [];
            if (required.length === 0) {
                examScore = 100; // No exams required -> Good match
            }
            else {
                // Check intersection
                const hasOverlap = required.some(ex => examsGiven.some((uEx) => uEx.toLowerCase() === ex.toLowerCase()));
                examScore = hasOverlap ? 100 : 0;
            }
            if (examScore === 100 && required.length > 0)
                reasons.push("Exam Match");
            // C. Restart Score (30%)
            // Normalize: 10 -> 100, 0 -> 0.
            restartScoreVal = ((college.restart_score || 0) / 10) * 100;
            // Apply Preference Boost
            if (college.isNewGen && collegeTypePreference === 'prefer_new_gen') {
                restartScoreVal = Math.min(restartScoreVal * 1.20, 100); // +20% Boost, capped at 100
                reasons.push("New-Gen Fit");
            }
            if ((college.restart_score || 0) >= 8.5 || (college.isNewGen && collegeTypePreference === 'prefer_new_gen')) {
                // Push reason if high score OR explicit preference match
                if (!reasons.includes("New-Gen Fit") && (college.restart_score || 0) >= 8.5)
                    reasons.push("High Score");
            }
            // D. Location Scoring (15%)
            // Match Country first
            if (college.country.toLowerCase() === 'india' && preferredCountries.includes('India')) {
                // Check state
                if (college.location.state && prefs.preferredStates?.includes(college.location.state)) {
                    locationScore = 100;
                    reasons.push("State Match");
                }
                else {
                    locationScore = 50; // Country match but not state
                }
            }
            else if (preferredCountries.includes(college.country)) {
                locationScore = 100;
                reasons.push("Country Match");
            }
            else {
                locationScore = 0;
            }
            // TOTAL SCORE
            const totalScore = ((budgetScore * W_BUDGET) +
                (examScore * W_EXAM) +
                (restartScoreVal * W_RESTART) +
                (locationScore * W_LOCATION));
            // Log for debug (optional, can remove later)
            // if (college.name === 'Specific College') console.log(college.name, totalScore);
            return {
                ...college,
                matchPercentage: Math.round(totalScore),
                why: reasons.slice(0, 3),
                location: college.location
            };
        }).filter(Boolean);
        // 3. Sort & Diversity
        scoredCandidates.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        // Rule: Max 1 college per city AND Unique Images
        const cityMap = new Set();
        const imageMap = new Set();
        const finalMatches = [];
        for (const c of scoredCandidates) {
            const city = c.location?.city || 'Unknown';
            const img = c.image || '';
            // Check City Uniqueness
            const isCityUnique = !cityMap.has(city) || city === 'Unknown';
            // Check Image Uniqueness (if image exists)
            const isImageUnique = !img || !imageMap.has(img);
            if (isCityUnique && isImageUnique) {
                if (city !== 'Unknown')
                    cityMap.add(city);
                if (img)
                    imageMap.add(img);
                finalMatches.push(c);
            }
            if (finalMatches.length >= 6)
                break;
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
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard recommendations:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getDashboardRecommendations = getDashboardRecommendations;
