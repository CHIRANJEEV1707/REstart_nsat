import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { z } from 'zod';



// @desc    Save Onboarding Data (Progressive)
// @route   POST /api/user/onboarding
export const saveOnboarding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { step } = req.body;
        const userId = req.user?._id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (step === 2) {
            // Step 2: Personal Details
            const step2Schema = z.object({
                city: z.string().min(1, 'City is required'),
                country: z.string().min(1, 'Country is required'),
                phoneNumber: z.string().optional()
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

        } else if (step === 3) {
            // Step 3: College Preferences
            const step3Schema = z.object({
                targetDegree: z.string().min(1),
                aspiringCollegeType: z.array(z.string()),
                preferredCountries: z.array(z.string()),
                budgetUSD: z.object({ min: z.number(), max: z.number() }).optional(),
                budgetINR: z.object({ min: z.number(), max: z.number() }).optional(),
                interestedExams: z.array(z.string()).optional(),
                examScores: z.array(z.object({ exam: z.string(), score: z.string() })).optional(),
                newGenInterest: z.boolean().optional()
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
        } else {
            res.status(400).json({ success: false, message: 'Invalid onboarding step' });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `Onboarding step ${step} saved`
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
