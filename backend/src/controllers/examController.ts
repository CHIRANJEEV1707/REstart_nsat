import { Request, Response } from 'express';
import Exam from '../models/Exam';

// @desc    Get all exams
// @route   GET /api/exams
export const getExams = async (req: Request, res: Response) => {
    try {
        const exams = await Exam.find();
        res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
export const getExam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Try to find by slug first, then by _id
        let exam = await Exam.findOne({ slug: id });
        if (!exam) {
            // Try by _id if slug didn't match
            exam = await Exam.findById(id).catch(() => null);
        }

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
