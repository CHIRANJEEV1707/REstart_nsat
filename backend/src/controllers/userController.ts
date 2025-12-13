import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { z } from 'zod';

// Validation Schema for Onboarding
const onboardingSchema = z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'), // Default 'India' is sent
    targetDegree: z.string().min(1, 'Target degree is required'),
    aspiringCollegeType: z.array(z.string()).min(1, 'Select at least one college type'),
    budgetUSD: z.object({
        min: z.number().min(0),
        max: z.number().min(0)
    }),
    preferredCountries: z.array(z.string()).min(0),
    interestedExams: z.array(z.string()).optional(),
    examScores: z.array(z.object({
        exam: z.string(),
        score: z.string()
    })).optional()
});

// @desc    Save Onboarding Data
// @route   POST /api/user/onboarding
export const saveOnboarding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate input
        const validatedData = onboardingSchema.parse(req.body);

        // Find user and update
        // @ts-ignore
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Update user profile and status
        user.profile = validatedData;

        // Sync to legacy fields (Mapped where possible)
        if (validatedData.city) user.city = validatedData.city;
        if (validatedData.state) user.state = validatedData.state;
        user.country = validatedData.country;
        user.target_degree = validatedData.targetDegree;
        user.college_type_aspiring = validatedData.aspiringCollegeType;
        user.preferred_countries = validatedData.preferredCountries;
        user.budget_range = validatedData.budgetUSD; // Use USD values for now in legacy
        user.target_exams = validatedData.interestedExams;
        user.exam_scores = validatedData.examScores;

        user.onboardingCompleted = true; // Use USD values for now in legacy

        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'Onboarding completed successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get User Profile
// @route   GET /api/user/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const user = await User.findById(userId);

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
    } catch (error) {
        next(error);
    }
};
