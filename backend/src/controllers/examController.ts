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
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
