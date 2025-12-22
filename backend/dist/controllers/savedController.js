"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSavedCollege = exports.saveCollege = exports.getSavedColleges = void 0;
const User_1 = __importDefault(require("../models/User"));
const College_1 = __importDefault(require("../models/College"));
const InternationalCollege_1 = __importDefault(require("../models/InternationalCollege"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
const logger_1 = __importDefault(require("../utils/logger"));
// @desc    Get saved colleges
// @route   GET /api/saved
const getSavedColleges = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id)
            .populate('saved_colleges')
            .populate('saved_international_colleges')
            .populate('saved_newgen_colleges');
        if (!user) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        // Add type to each college object
        const indianColleges = (user.saved_colleges || []).map((c) => ({ ...c.toObject(), type: 'indian' }));
        const internationalColleges = (user.saved_international_colleges || []).map((c) => ({ ...c.toObject(), type: 'international' }));
        const newGenColleges = (user.saved_newgen_colleges || []).map((c) => ({ ...c.toObject(), type: 'newgen' }));
        const allSaved = [...indianColleges, ...internationalColleges, ...newGenColleges];
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
// @desc    Toggle save college (Add/Remove)
// @route   POST /api/saved
const saveCollege = async (req, res) => {
    try {
        let { collegeId, collegeType } = req.body; // collegeType: 'indian' | 'international' | 'newgen'
        // If collegeId provided in params (POST /:id) legacy support
        if (req.params.id) {
            collegeId = req.params.id;
        }
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID is required' });
        }
        // Default to indian if not specified
        const type = collegeType || 'indian';
        // Check if college exists in the correct collection
        let collegeExists = false;
        if (type === 'international') {
            const count = await InternationalCollege_1.default.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        }
        else if (type === 'newgen') {
            const count = await NewGenCollege_1.default.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        }
        else {
            const count = await College_1.default.countDocuments({ _id: collegeId });
            collegeExists = count > 0;
        }
        if (!collegeExists) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        // @ts-ignore
        const user = await User_1.default.findById(req.user?._id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const targetArray = type === 'international' ? 'saved_international_colleges'
            : type === 'newgen' ? 'saved_newgen_colleges'
                : 'saved_colleges';
        // Check if already saved
        // @ts-ignore
        const currentList = user[targetArray] || [];
        // @ts-ignore
        const isSaved = currentList.some(id => id.toString() === collegeId);
        if (isSaved) {
            // Remove
            await User_1.default.updateOne({ _id: req.user?._id }, { $pull: { [targetArray]: collegeId } });
            return res.status(200).json({ success: true, saved: false, message: 'College removed' });
        }
        else {
            // Add
            await User_1.default.updateOne({ _id: req.user?._id }, { $addToSet: { [targetArray]: collegeId } });
            return res.status(200).json({ success: true, saved: true, message: 'College saved' });
        }
    }
    catch (error) {
        logger_1.default.error('Error toggling saved college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.saveCollege = saveCollege;
// @desc    Remove saved college (Legacy/Explicit Delete)
// @route   DELETE /api/saved/:id
const removeSavedCollege = async (req, res) => {
    // Forward logic to saveCollege or keep explicit delete
    // For now, repurpose logic or keep strict delete
    try {
        const collegeId = req.params.id;
        const type = req.query.type || 'indian';
        const updateField = type === 'international' ? 'saved_international_colleges'
            : type === 'newgen' ? 'saved_newgen_colleges'
                : 'saved_colleges';
        await User_1.default.updateOne({ _id: req.user?._id }, { $pull: { [updateField]: collegeId } });
        res.status(200).json({ success: true, saved: false, message: 'College removed' });
    }
    catch (error) {
        logger_1.default.error('Error removing saved college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.removeSavedCollege = removeSavedCollege;
