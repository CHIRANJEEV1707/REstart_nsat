import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

interface JwtPayload {
    id: string;
}

// Helper to get user from token
async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decoded.id;
    } catch {
        return null;
    }
}

// Validation schema for preferences
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
    collegeTypes: z.array(z.string()).optional(),
    preferredCountries: z.array(z.string()).min(1, "At least one country is required"),
    preferredStates: z.array(z.string()).optional(),
    collegeTypePreference: z.enum(["prefer_new_gen", "neutral", "prefer_traditional"]).optional()
});

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = preferencesSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: 'Validation Error',
                errors: validation.error.format()
            }, { status: 400 });
        }

        const data = validation.data;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Construct standardized preferences object
        const newPreferences = {
            targetDegree: data.targetDegree,
            budget: data.budget,
            examScores: data.examScores || [],
            collegeTypes: data.collegeTypes || [],
            preferredCountries: data.preferredCountries,
            preferredStates: data.preferredStates || [],
            collegeTypePreference: data.collegeTypePreference,
        };

        // Merge with existing preferences
        user.preferences = {
            ...user.preferences,
            ...newPreferences
        } as any;

        // Sync legacy top-level fields for compatibility
        user.onboardingCompleted = true;
        user.target_degree = data.targetDegree;
        user.preferred_countries = data.preferredCountries;

        await user.save();

        return NextResponse.json({
            success: true,
            data: user,
            message: 'Preferences saved successfully'
        });
    } catch (error: any) {
        console.error('[Save Preferences Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to save preferences' },
            { status: 500 }
        );
    }
}
