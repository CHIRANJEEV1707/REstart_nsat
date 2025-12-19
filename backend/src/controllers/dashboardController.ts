import { Request, Response } from 'express';
import User from '../models/User';
import College from '../models/College';
import Exam from '../models/Exam';
import { generateAlerts } from '../utils/alertGenerator';
import logger from '../utils/logger';

// @desc    Get dashboard metrics (Saved, Recommended, Deadlines, Alerts)
// @route   GET /api/dashboard

// @desc    Get dashboard metrics (Saved, Recommended, Deadlines, Alerts)
// @route   GET /api/dashboard
export const getDashboardData = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            res.cookie('token', 'none', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true
            });
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const user = await User.findById(req.user._id).populate('saved_colleges');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Recommendations (Fit Score based on restart_score)
        let rawRecommendations = [];
        if (user.state) {
            rawRecommendations = await College.find({ 'location.state': user.state }).sort('-restart_score').limit(3);
        } else {
            rawRecommendations = await College.find().sort('-restart_score').limit(3);
        }

        // If not enough recommendations from state, fill with top colleges
        if (rawRecommendations.length < 3) {
            const moreColleges = await College.find({ _id: { $nin: rawRecommendations.map((c: any) => c._id) } }).sort('-restart_score').limit(3 - rawRecommendations.length);
            rawRecommendations = [...rawRecommendations, ...moreColleges];
        }

        const recommendations = rawRecommendations.map((col: any) => ({
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
        upcomingExams = await Exam.find({
            $or: [
                { 'dates.registration_end': { $gte: today } },
                { 'dates.exam_date_start': { $gte: today } }
            ]
        }).sort('dates.registration_end').limit(5);



        // ... (imports)

        // inside getDashboardData
        // 3. Dynamic Alerts
        const alerts = generateAlerts(user, upcomingExams);

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
                saved_colleges: user.saved_colleges ? user.saved_colleges.map((c: any) => ({
                    _id: c._id,
                    name: c.name,
                    tags: c.badges || [],
                    location: c.location ? `${c.location.city}, ${c.location.state}` : 'Unknown'
                })) : [],
                recommendations,
                deadlines: upcomingExams.map((e: any) => ({
                    _id: e._id,
                    name: e.name,
                    date: e.dates.registration_end || e.dates.exam_date_start,
                    type: e.dates.registration_end > today ? 'Registration' : 'Exam Date'
                })),
                alerts
            }
        });
    } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
