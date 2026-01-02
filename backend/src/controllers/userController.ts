import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { z } from 'zod';
import { DEGREE_EXAM_MAP } from '../constants/degrees';

interface ExamScoreInput {
    degree: string;
    exam: string;
    score: number;
    fullMarks: number;
    rank?: number;
    year?: number;
}

// ... existing code ...

// @desc    Update Exam Scores
// @route   PATCH /api/user/exams
export const updateExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;

        // Safety Step 1: Safely extract with type assertion
        const rawExamScores: any[] = Array.isArray(req.body.examScores) ? req.body.examScores : [];

        // Safety Step 2: Validate against allowed Degree-Exam Map
        const validatedExamScores = rawExamScores.filter((item: any) => {
            const validDegree = item.degree && DEGREE_EXAM_MAP[item.degree as keyof typeof DEGREE_EXAM_MAP];
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

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (!user.preferences) user.preferences = {};

        // Replace exam scores safely
        user.preferences.examScores = validatedExamScores.map((item: any) => ({
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
    } catch (error) {
        next(error);
    }
};


// @desc    Save User Preferences (Onboarding Complete)
// @route   POST /api/users/preferences
export const savePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Strict Zod Schema matching new Frontend Interface
        const preferencesSchema = z.object({
            targetDegree: z.array(z.string()).min(1, "At least one degree is required"),

            budget: z.object({
                currency: z.enum(['INR', 'USD']),
                amount: z.number().gt(0, "Budget must be greater than 0")
            }),

            examScores: z.array(z.object({
                exam: z.string().min(1),
                score: z.number().min(0),
                fullMarks: z.number().min(1),
                rank: z.number().optional()
            })).optional(),

            // Keeping these for now as they might come from other steps or defaults
            preferredCountries: z.array(z.string()).min(1, "At least one country is required"),
            preferredStates: z.array(z.string()).optional(),
            collegeTypePreference: z.enum(["prefer_new_gen", "neutral", "prefer_traditional"]).optional()
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
        const newPreferences: any = {
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

    } catch (error) {
        next(error);
    }
};

// @desc    Get User Profile
// @route   GET /api/user/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId).populate({
            path: 'purchasedBundles.bundleId',
            model: 'Bundle'
        });

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
                purchasedBundles: user.purchasedBundles
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Basic Profile Info
// @route   PATCH /api/user/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        console.log(`[updateProfile] HIT for user: ${userId}`);
        console.log(`[updateProfile] Body:`, req.body);

        const { name, phone, address } = req.body; // Expect address = { city, state, country }

        const user = await User.findById(userId);
        if (!user) {
            console.log(`[updateProfile] User not found`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;

        // Ensure profile object exists
        if (!user.profile) {
            user.profile = {
                city: '',
                state: '',
                country: '',
                phoneNumber: ''
            };
        }

        if (phone !== undefined) user.profile.phoneNumber = phone;

        if (address) {
            if (address.city !== undefined) user.profile.city = address.city;
            if (address.state !== undefined) user.profile.state = address.state;
            if (address.country !== undefined) user.profile.country = address.country;
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
    } catch (error) {
        console.error(`[updateProfile] Error:`, error);
        next(error);
    }
};


