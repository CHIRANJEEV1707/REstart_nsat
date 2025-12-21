"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyPlan = exports.createPrepPlan = void 0;
const PrepPlan_1 = __importDefault(require("../models/PrepPlan"));
const Exam_1 = __importDefault(require("../models/Exam"));
const logger_1 = __importDefault(require("../utils/logger"));
const prepPlanConfig_1 = require("../config/prepPlanConfig");
// @desc    Create Prep Plan
// @route   POST /api/prep/plans
const createPrepPlan = async (req, res) => {
    try {
        const { examId, durationWeeks } = req.body;
        // Check if exam valid
        const exam = await Exam_1.default.findById(examId);
        if (!exam)
            return res.status(404).json({ success: false, message: 'Exam not found' });
        // Generate weekly plan using configuration
        const weeks = (0, prepPlanConfig_1.generateWeeklyPlan)(durationWeeks);
        const plan = await PrepPlan_1.default.create({
            user: req.user?._id,
            exam: examId,
            weeks
        });
        res.status(201).json({ success: true, data: plan });
    }
    catch (error) {
        logger_1.default.error('Error creating prep plan:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.createPrepPlan = createPrepPlan;
// @desc    Get My Plan
// @route   GET /api/prep/plans/my
const getMyPlan = async (req, res) => {
    try {
        const plan = await PrepPlan_1.default.findOne({ user: req.user?._id }).populate('exam');
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getMyPlan = getMyPlan;
