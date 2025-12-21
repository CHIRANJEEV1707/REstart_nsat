"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSavedCollege = exports.saveCollege = exports.getSavedColleges = void 0;
const User_1 = __importDefault(require("../models/User"));
const College_1 = __importDefault(require("../models/College"));
const InternationalCollege_1 = __importDefault(require("../models/InternationalCollege"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Get saved colleges
// @route   GET /api/saved
const getSavedColleges = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id)
            .populate('saved_colleges')
            .populate('saved_international_colleges');
        if (!user) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        // Add type to each college object
        const indianColleges = (user.saved_colleges || []).map((c) => ({ ...c.toObject(), type: 'indian' }));
        const internationalColleges = (user.saved_international_colleges || []).map((c) => ({ ...c.toObject(), type: 'international' }));
        const allSaved = [...indianColleges, ...internationalColleges];
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).json({ success: true, count: allSaved.length, data: allSaved });
    }
    catch (error) {
        logger_1.default.error('Error fetching saved colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getSavedColleges = getSavedColleges;
// @desc    Save a college
// @route   POST /api/saved
const saveCollege = async (req, res) => {
    try {
        const { collegeId, collegeType } = req.body; // collegeType: 'indian' | 'international'
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID is required' });
        }
        // Default to indian if not specified
        const type = collegeType || 'indian';
        // Check if college exists
        let college;
        if (type === 'international') {
            college = await InternationalCollege_1.default.findById(collegeId);
        }
        else {
            college = await College_1.default.findById(collegeId);
        }
        if (!college)
            return res.status(404).json({ success: false, message: 'College not found' });
        // @ts-ignore
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        // Check if already saved and save
        if (type === 'international') {
            // @ts-ignore
            if (user.saved_international_colleges?.some(id => id.toString() === collegeId)) {
                return res.status(400).json({ success: false, message: 'College already saved' });
            }
            // @ts-ignore
            if (!user.saved_international_colleges)
                user.saved_international_colleges = [];
            // @ts-ignore
            user.saved_international_colleges.push(collegeId);
        }
        else {
            // @ts-ignore
            if (user.saved_colleges?.some(id => id.toString() === collegeId)) {
                return res.status(400).json({ success: false, message: 'College already saved' });
            }
            // @ts-ignore
            if (!user.saved_colleges)
                user.saved_colleges = [];
            // @ts-ignore
            user.saved_colleges.push(collegeId);
        }
        await user.save();
        res.status(200).json({ success: true, message: 'College saved' });
    }
    catch (error) {
        logger_1.default.error('Error saving college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.saveCollege = saveCollege;
// @desc    Remove saved college
// @route   DELETE /api/saved/:id?type=indian
const removeSavedCollege = async (req, res) => {
    try {
        const collegeId = req.params.id;
        const type = req.query.type || 'indian';
        // @ts-ignore
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        if (type === 'international') {
            // @ts-ignore
            if (user.saved_international_colleges) {
                // @ts-ignore
                user.saved_international_colleges = user.saved_international_colleges.filter(id => id.toString() !== collegeId);
            }
        }
        else {
            // @ts-ignore
            if (user.saved_colleges) {
                // @ts-ignore
                user.saved_colleges = user.saved_colleges.filter(id => id.toString() !== collegeId);
            }
        }
        await user.save();
        res.status(200).json({ success: true, message: 'College removed from saved list' });
    }
    catch (error) {
        logger_1.default.error('Error removing saved college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.removeSavedCollege = removeSavedCollege;
