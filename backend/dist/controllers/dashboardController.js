"use strict";
const User = require('../models/User');
const College = require('../models/College');
const Exam = require('../models/Exam');
const PrepPlan = require('../models/PrepPlan');
// @desc    Get dashboard metrics (Saved, Recommended, Plan)
// @route   GET /api/dashboard
// @desc    Get dashboard metrics (Saved, Recommended, Deadlines, Alerts)
// @route   GET /api/dashboard
exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('saved_colleges');
        // 1. Recommendations (Mock Fit Score)
        let rawRecommendations = [];
        if (user.state) {
            rawRecommendations = await College.find({ 'location.state': user.state }).limit(3);
        }
        else {
            rawRecommendations = await College.find().sort('-restart_score').limit(3);
        }
        const recommendations = rawRecommendations.map(col => ({
            _id: col._id,
            name: col.name,
            logo: col.images?.[0] || '/college-placeholder.png', // Fallback
            fit_score: Math.floor(Math.random() * (98 - 85) + 85), // Random score 85-98
            fees: col.fees?.btech ? `₹${col.fees.btech.toLocaleString()}/yr` : '₹1.5L/yr', // Mock or real
            exam: col.exams_required?.[0] || 'JEE Main'
        }));
        // 2. Deadlines (Upcoming Exams)
        let upcomingExams = [];
        if (user.target_exams && user.target_exams.length > 0) {
            upcomingExams = await Exam.find({ name: { $in: user.target_exams } });
        }
        else {
            upcomingExams = await Exam.find().sort('dates.exam_date_start').limit(5);
        }
        // 3. Mock Alerts (Static for now)
        const alerts = [
            { id: 1, type: 'info', message: 'JEE Main 2025 Registration closes in 15 days.' },
            { id: 2, type: 'success', message: 'New scholarship "Merit First" is available for your profile.' },
            { id: 3, type: 'warning', message: 'VITEEE exam dates have been updated.' }
        ];
        // 4. Fit Overview (Calculated)
        const fitOverview = {
            total_matches: recommendations.length + 12, // Mock count
            score_range: '85% - 92%'
        };
        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    saved_count: user.saved_colleges.length
                },
                fit_overview: fitOverview,
                saved_colleges: user.saved_colleges.map(c => ({
                    _id: c._id,
                    name: c.name,
                    tags: ['Good Fit', 'High ROI'], // Mock tags for UI
                    location: `${c.location.city}, ${c.location.state}`
                })),
                recommendations,
                deadlines: upcomingExams.map(e => ({
                    _id: e._id,
                    name: e.name,
                    date: e.dates.registration_end || e.dates.exam_date_start,
                    type: 'Registration'
                })),
                alerts
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
