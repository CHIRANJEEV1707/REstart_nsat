"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlerts = void 0;
const User_1 = __importDefault(require("../models/User"));
const Exam_1 = __importDefault(require("../models/Exam"));
const alertGenerator_1 = require("../utils/alertGenerator");
// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        const today = new Date();
        // Fetch ALL upcoming exams to check for alerts (more comprehensive than dashboard which limits to 5)
        const upcomingExams = await Exam_1.default.find({
            $or: [
                { 'dates.registration_end': { $gte: today } },
                { 'dates.exam_date_start': { $gte: today } }
            ]
        }).sort('dates.registration_end');
        const alerts = (0, alertGenerator_1.generateAlerts)(user, upcomingExams);
        res.status(200).json({
            success: true,
            data: alerts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAlerts = getAlerts;
