"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.savePreferences = exports.updateExams = void 0;
const User_1 = __importDefault(require("../models/User"));
const zod_1 = require("zod");
const degrees_1 = require("../constants/degrees");
// ... existing code ...
// @desc    Update Exam Scores
// @route   PATCH /api/user/exams
const updateExams = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        // Safety Step 1: Safely extract with type assertion
        const rawExamScores = Array.isArray(req.body.examScores) ? req.body.examScores : [];
        // Safety Step 2: Validate against allowed Degree-Exam Map
        const validatedExamScores = rawExamScores.filter((item) => {
            const validDegree = item.degree && degrees_1.DEGREE_EXAM_MAP[item.degree];
            const validExam = validDegree && validDegree.includes(item.exam);
            const validScore = typeof item.score === 'number' && item.score >= 0;
            const validFullMarks = typeof item.fullMarks === 'number' && item.fullMarks > 0;
            return validDegree && validExam && validScore && validFullMarks;
        });
        if (rawExamScores.length > 0 && validatedExamScores.length === 0) {
            res.status(400).json({
                success: false,
                message: "Invalid exam data. Please ensure exams match the selected degree and scores are valid."
            });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (!user.preferences)
            user.preferences = {};
        // Replace exam scores safely
        user.preferences.examScores = validatedExamScores.map((item) => ({
            degree: item.degree,
            exam: item.exam,
            score: item.score,
            fullMarks: item.fullMarks,
            rank: item.rank || undefined,
            year: item.year || new Date().getFullYear()
        }));
        user.markModified('preferences');
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Exam scores updated successfully',
            data: user.preferences.examScores
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateExams = updateExams;
// @desc    Save User Preferences (Onboarding Complete)
// @route   POST /api/users/preferences
const savePreferences = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Strict Zod Schema matching new Frontend Interface
        const preferencesSchema = zod_1.z.object({
            targetDegree: zod_1.z.array(zod_1.z.string()).min(1, "At least one degree is required"),
            budget: zod_1.z.object({
                currency: zod_1.z.enum(['INR', 'USD']),
                amount: zod_1.z.number().gt(0, "Budget must be greater than 0")
            }),
            examScores: zod_1.z.array(zod_1.z.object({
                exam: zod_1.z.string().min(1),
                score: zod_1.z.number().min(0),
                fullMarks: zod_1.z.number().min(1),
                rank: zod_1.z.number().optional()
            })).optional(),
            // Keeping these for now as they might come from other steps or defaults
            preferredCountries: zod_1.z.array(zod_1.z.string()).min(1, "At least one country is required"),
            preferredStates: zod_1.z.array(zod_1.z.string()).optional(),
            collegeTypePreference: zod_1.z.enum(["prefer_new_gen", "neutral", "prefer_traditional"]).optional()
        });
        const validation = preferencesSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: validation.error.format()
            });
            return;
        }
        const data = validation.data;
        // Construct standardized preferences object
        // Explicitly strict assignment
        const newPreferences = {
            targetDegree: data.targetDegree,
            budget: data.budget,
            examScores: data.examScores || [],
            preferredCountries: data.preferredCountries,
            preferredStates: data.preferredStates || [],
            collegeTypePreference: data.collegeTypePreference,
        };
        // Merge with existing preferences safely
        user.preferences = {
            // @ts-ignore
            ...user.preferences,
            ...newPreferences
        };
        // Sync legacy top-level fields for compatibility
        user.onboardingCompleted = true;
        user.target_degree = data.targetDegree;
        user.preferred_countries = data.preferredCountries;
        await user.save();
        res.status(200).json({
            success: true,
            data: user,
            message: 'Preferences saved successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.savePreferences = savePreferences;
// @desc    Get User Profile
// @route   GET /api/user/profile
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted,
                profile: user.profile,
                preferences: user.preferences,
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
// @desc    Update Basic Profile Info
// @route   PATCH /api/user/profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        console.log(`[updateProfile] HIT for user: ${userId}`);
        console.log(`[updateProfile] Body:`, req.body);
        const { name, phone, address } = req.body; // Expect address = { city, state, country }
        const user = await User_1.default.findById(userId);
        if (!user) {
            console.log(`[updateProfile] User not found`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (name)
            user.name = name;
        // Ensure profile object exists
        if (!user.profile) {
            user.profile = {
                city: '',
                state: '',
                country: '',
                phoneNumber: ''
            };
        }
        if (phone !== undefined)
            user.profile.phoneNumber = phone;
        if (address) {
            if (address.city !== undefined)
                user.profile.city = address.city;
            if (address.state !== undefined)
                user.profile.state = address.state;
            if (address.country !== undefined)
                user.profile.country = address.country;
        }
        // Mongoose might not detect deep changes in some cases, though usually it does for schema fields.
        // Marking modified just in case if profile was undefined initially.
        user.markModified('profile');
        console.log(`[updateProfile] Saving user...`);
        await user.save();
        console.log(`[updateProfile] Saved.`);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    }
    catch (error) {
        console.error(`[updateProfile] Error:`, error);
        next(error);
    }
};
exports.updateProfile = updateProfile;
