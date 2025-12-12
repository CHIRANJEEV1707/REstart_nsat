import { Request, Response } from 'express';
import PrepPlan from '../models/PrepPlan';
import Exam from '../models/Exam';

// @desc    Create Prep Plan
// @route   POST /api/prep/plans
export const createPlan = async (req: Request, res: Response) => {
    try {
        const { examId, durationWeeks } = req.body;

        // Check if exam valid
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        // Simple logic to generate dummy weeks based on duration
        const subjects = ['Physics', 'Chemistry', 'Maths'];
        const weeks = [];
        for (let i = 1; i <= durationWeeks; i++) {
            weeks.push({
                weekNumber: i,
                subjects: {
                    Physics: [`Topic P${i}-A`, `Topic P${i}-B`],
                    Chemistry: [`Topic C${i}-A`],
                    Math: [`Topic M${i}-A`, `Topic M${i}-B`]
                },
                completed: false
            });
        }

        const plan = await PrepPlan.create({
            // @ts-ignore
            user: req.user.id,
            exam: examId,
            weeks
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get My Plan
// @route   GET /api/prep/plans/my
export const getMyPlan = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const plan = await PrepPlan.findOne({ user: req.user.id }).populate('exam');
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
