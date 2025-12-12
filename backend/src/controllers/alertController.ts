import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import { generateAlerts } from '../utils/alertGenerator';

// @desc    Get all alerts
// @route   GET /api/alerts
export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id);
        const today = new Date();

        // Fetch ALL upcoming exams to check for alerts (more comprehensive than dashboard which limits to 5)
        const upcomingExams = await Exam.find({
            $or: [
                { 'dates.registration_end': { $gte: today } },
                { 'dates.exam_date_start': { $gte: today } }
            ]
        }).sort('dates.registration_end');

        const alerts = generateAlerts(user, upcomingExams);

        res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
};
