"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const User_1 = __importDefault(require("../models/User"));
const College_1 = __importDefault(require("../models/College"));
const Exam_1 = __importDefault(require("../models/Exam"));
const alertGenerator_1 = require("../utils/alertGenerator");
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Get dashboard metrics (Saved, Recommended, Deadlines, Alerts)
// @route   GET /api/dashboard
// @desc    Get dashboard metrics (Saved, Recommended, Deadlines, Alerts)
// @route   GET /api/dashboard
const getDashboardData = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            res.cookie('token', 'none', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true
            });
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const user = await User_1.default.findById(req.user._id).populate('saved_colleges');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // 1. Recommendations (Fit Score based on restart_score)
        let rawRecommendations = [];
        if (user.state) {
            rawRecommendations = await College_1.default.find({ 'location.state': user.state }).sort('-restart_score').limit(3);
        }
        else {
            rawRecommendations = await College_1.default.find().sort('-restart_score').limit(3);
        }
        // If not enough recommendations from state, fill with top colleges
        if (rawRecommendations.length < 3) {
            const moreColleges = await College_1.default.find({ _id: { $nin: rawRecommendations.map((c) => c._id) } }).sort('-restart_score').limit(3 - rawRecommendations.length);
            rawRecommendations = [...rawRecommendations, ...moreColleges];
        }
        const recommendations = rawRecommendations.map((col) => ({
            _id: col._id,
            name: col.name,
            logo: '/college-placeholder.png', // Placeholder until image field exists
            fit_score: Math.round((col.restart_score || 0) * 10), // Convert 0-10 scale to percentage
            fees: col.fees ? `₹${col.fees.toLocaleString()}/yr` : 'N/A',
            exam: col.exams_required?.[0] || 'Merit'
        }));
        // 2. Deadlines (Upcoming Exams)
        let upcomingExams = [];
        const today = new Date();
        // Find exams with upcoming dates
        upcomingExams = await Exam_1.default.find({
            $or: [
                { 'dates.registration_end': { $gte: today } },
                { 'dates.exam_date_start': { $gte: today } }
            ]
        }).sort('dates.registration_end').limit(5);
        // ... (imports)
        // inside getDashboardData
        // 3. Dynamic Alerts
        const alerts = (0, alertGenerator_1.generateAlerts)(user, upcomingExams);
        // 4. Fit Overview (Calculated)
        const savedCount = user.saved_colleges ? user.saved_colleges.length : 0;
        const fitOverview = {
            total_matches: rawRecommendations.length,
            score_range: recommendations.length > 0 ? `${Math.min(...recommendations.map(r => r.fit_score))}% - ${Math.max(...recommendations.map(r => r.fit_score))}%` : 'N/A'
        };
        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    onboardingCompleted: user.onboardingCompleted,
                    saved_count: savedCount
                },
                fit_overview: fitOverview,
                saved_colleges: user.saved_colleges ? user.saved_colleges.map((c) => ({
                    _id: c._id,
                    name: c.name,
                    tags: c.badges || [],
                    location: c.location ? `${c.location.city}, ${c.location.state}` : 'Unknown'
                })) : [],
                recommendations,
                deadlines: upcomingExams.map((e) => ({
                    _id: e._id,
                    name: e.name,
                    date: e.dates.registration_end || e.dates.exam_date_start,
                    type: e.dates.registration_end > today ? 'Registration' : 'Exam Date'
                })),
                alerts
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getDashboardData = getDashboardData;
