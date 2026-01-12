import { Request, Response } from 'express';
import PrepPlan from '../models/PrepPlan';
import Exam from '../models/Exam';
import logger from '../utils/logger';
import { generateWeeklyPlan } from '../config/prepPlanConfig';

// @desc    Create Prep Plan
// @route   POST /api/prep/plans
export const createPrepPlan = async (req: Request, res: Response) => {
    try {
        const { examId, durationWeeks } = req.body;

        // Check if exam valid
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        // Generate weekly plan using configuration
        const weeks = generateWeeklyPlan(durationWeeks);

        const plan = await PrepPlan.create({
            user: req.user?._id,
            exam: examId,
            weeks
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        logger.error('Error creating prep plan:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get My Plan
// @route   GET /api/prep/plans/my
export const getMyPlan = async (req: Request, res: Response) => {
    try {
        const plan = await PrepPlan.findOne({ user: req.user?._id }).populate('exam');
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
