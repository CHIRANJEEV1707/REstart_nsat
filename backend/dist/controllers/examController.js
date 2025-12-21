"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExam = exports.getExams = void 0;
const Exam_1 = __importDefault(require("../models/Exam"));
// @desc    Get all exams
// @route   GET /api/exams
const getExams = async (req, res) => {
    try {
        const exams = await Exam_1.default.find();
        res.status(200).json({ success: true, count: exams.length, data: exams });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getExams = getExams;
// @desc    Get single exam
// @route   GET /api/exams/:id
const getExam = async (req, res) => {
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        res.status(200).json({ success: true, data: exam });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getExam = getExam;
