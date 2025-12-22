"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareColleges = void 0;
const College_1 = __importDefault(require("../models/College"));
const InternationalCollege_1 = __importDefault(require("../models/InternationalCollege"));
const logger_1 = __importDefault(require("../utils/logger"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
// Helper to normalize Indian College data
const normalizeIndianCollege = (col) => ({
    _id: col._id,
    name: col.name,
    type: 'indian',
    location: `${col.location.city}, ${col.location.state}`,
    ranking: `#${col?.restart_score || 0}/10 REstart Score`,
    fees: `₹${col.fees.toLocaleString()}/yr`,
    exams: col.exams_required.join(', '),
    highlights: col.badges.slice(0, 3),
    website: col.website,
    institute_type: col.type,
    restart_score: col.restart_score // Added for frontend
});
// Helper to normalize New-Gen College data
const normalizeNewGenCollege = (col) => ({
    _id: col._id,
    name: col.name,
    type: 'newgen',
    location: `${col.location.city}, ${col.location.state}`,
    ranking: `#${col?.restart_score || 0}/10 REstart Score`,
    fees: `₹${col.fees.toLocaleString()}/yr`,
    exams: col.exams_required.join(', '),
    highlights: col.badges?.slice(0, 3) || [],
    website: col.website,
    institute_type: 'New-Gen Tech School',
    restart_score: col.restart_score // Added for frontend
});
// Helper to normalize International College data
const normalizeInternationalCollege = (col) => ({
    _id: col._id,
    name: col.name,
    type: 'international',
    location: `${col.city}, ${col.country}`,
    ranking: `#${col?.restart_score || 0}/10 REstart Score`, // Unified Ranking
    fees: `$${col.tuition_fee_annual.toLocaleString()}/yr`,
    exams: [
        ...col.entrance_exams,
        ...col.english_tests.map((t) => `${t} (min ${col.minimum_scores[t.toLowerCase()] || '-'})`)
    ].join(', '),
    highlights: col.badges.slice(0, 3),
    website: col.official_website,
    institute_type: col.university_type,
    restart_score: col.restart_score // Added for frontend
});
// @desc    Compare multiple colleges
// @route   POST /api/compare
const compareColleges = async (req, res) => {
    try {
        const { colleges } = req.body;
        if (!colleges || !Array.isArray(colleges) || colleges.length === 0) {
            return res.status(400).json({ success: false, message: 'No colleges selected' });
        }
        const indianIds = colleges.filter((c) => c.type === 'indian' || c.type === 'traditional').map((c) => c._id);
        const newGenIds = colleges.filter((c) => c.type === 'newgen').map((c) => c._id);
        const internationalIds = colleges.filter((c) => c.type === 'international').map((c) => c._id);
        const [indianColleges, newGenColleges, internationalColleges] = await Promise.all([
            College_1.default.find({ _id: { $in: indianIds } }),
            NewGenCollege_1.default.find({ _id: { $in: newGenIds } }),
            InternationalCollege_1.default.find({ _id: { $in: internationalIds } })
        ]);
        const normalizedIndian = indianColleges.map(normalizeIndianCollege);
        const normalizedNewGen = newGenColleges.map(normalizeNewGenCollege);
        const normalizedInternational = internationalColleges.map(normalizeInternationalCollege);
        const comparisonData = [...normalizedIndian, ...normalizedNewGen, ...normalizedInternational];
        res.status(200).json({
            success: true,
            data: comparisonData
        });
    }
    catch (error) {
        logger_1.default.error('Error comparing colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.compareColleges = compareColleges;
