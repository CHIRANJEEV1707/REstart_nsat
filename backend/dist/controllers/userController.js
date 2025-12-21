"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.saveOnboarding = void 0;
const User_1 = __importDefault(require("../models/User"));
const zod_1 = require("zod");
// @desc    Save Onboarding Data (Progressive)
// @route   POST /api/user/onboarding
const saveOnboarding = async (req, res, next) => {
    try {
        const { step } = req.body;
        const userId = req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (step === 2) {
            // Step 2: Personal Details
            const step2Schema = zod_1.z.object({
                city: zod_1.z.string().min(1, 'City is required'),
                country: zod_1.z.string().min(1, 'Country is required'),
                phoneNumber: zod_1.z.string().optional()
            });
            const data = step2Schema.parse(req.body.data);
            user.profile = {
                ...user.profile,
                country: data.country,
                city: data.city,
                phoneNumber: data.phoneNumber
            };
            // Sync legacy
            user.country = data.country;
            user.city = data.city;
            user.onboardingStep = 2;
            await user.save();
        }
        else if (step === 3) {
            // Step 3: College Preferences
            const step3Schema = zod_1.z.object({
                targetDegree: zod_1.z.string().min(1),
                aspiringCollegeType: zod_1.z.array(zod_1.z.string()),
                preferredCountries: zod_1.z.array(zod_1.z.string()),
                budgetUSD: zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() }).optional(),
                budgetINR: zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() }).optional(),
                interestedExams: zod_1.z.array(zod_1.z.string()).optional(),
                examScores: zod_1.z.array(zod_1.z.object({ exam: zod_1.z.string(), score: zod_1.z.string() })).optional(),
                newGenInterest: zod_1.z.boolean().optional()
            });
            const data = step3Schema.parse(req.body.data);
            user.preferences = {
                targetDegree: data.targetDegree,
                aspiringCollegeType: data.aspiringCollegeType,
                preferredCountries: data.preferredCountries,
                budgetUSD: data.budgetUSD,
                budgetINR: data.budgetINR,
                interestedExams: data.interestedExams,
                examScores: data.examScores,
                newGenInterest: data.newGenInterest || false
            };
            // Sync legacy
            user.target_degree = data.targetDegree;
            user.college_type_aspiring = data.aspiringCollegeType;
            user.preferred_countries = data.preferredCountries;
            user.budget_range = data.budgetINR || data.budgetUSD;
            user.target_exams = data.interestedExams;
            user.exam_scores = data.examScores;
            user.onboardingStep = 3;
            user.onboardingCompleted = true;
            await user.save();
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid onboarding step' });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
            message: `Onboarding step ${step} saved`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.saveOnboarding = saveOnboarding;
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
                profile: user.profile
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
