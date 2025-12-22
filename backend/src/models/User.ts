import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    onboardingCompleted: boolean;
    onboardingStep: number;
    profile?: {
        city?: string;
        state?: string;
        country?: string;
        phoneNumber?: string;
    };
    preferences?: {
        goal?: 'BTech' | 'MS' | 'MBA'; // Deprecated?

        // New Strict Budget
        budget?: {
            currency: 'INR' | 'USD';
            amount: number;
        };

        preferredCountries?: string[];
        preferredStates?: string[];

        // New Strict Exam Scores
        examScores?: {
            exam: string;
            score: number;
            fullMarks: number;
            rank?: number;
        }[];

        collegeTypes?: string[];

        // New Multi-Select Degree
        targetDegree?: string[];

        newGenInterest?: boolean;
        collegeTypePreference?: 'prefer_new_gen' | 'neutral' | 'prefer_traditional';

        // Legacy fields to be potentially removed or kept for backward compat if needed
        budgetMin?: number;
        budgetMax?: number;
    };

    // Flattened Legacy fields (some parts of app might still read these)
    state?: string;
    city?: string;
    country?: string;
    class_level?: string;

    // Updated to Array
    target_degree?: string[];

    college_type_aspiring?: string[];
    preferred_countries?: string[];
    target_exams?: string[];

    saved_colleges?: mongoose.Types.ObjectId[];
    saved_international_colleges?: mongoose.Types.ObjectId[];
    saved_newgen_colleges?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },

    onboardingCompleted: { type: Boolean, default: false, index: true },
    onboardingStep: { type: Number, default: 0 },

    profile: {
        city: String,
        state: String,
        country: String,
        phoneNumber: String
    },

    preferences: {
        goal: String,

        // New Strict Budget Schema
        budget: {
            currency: {
                type: String,
                enum: ['INR', 'USD'],
                default: 'INR'
            },
            amount: {
                type: Number,
                required: false // Validated in controller
            }
        },

        preferredCountries: [String],
        preferredStates: [String],
        collegeTypes: [String],

        // New Strict Degree Schema (Multi-select)
        targetDegree: {
            type: [String],
            default: []
        },

        // New Strict Exam Scores
        examScores: [{
            exam: { type: String, required: true },
            score: { type: Number, required: true, min: 0 },
            fullMarks: { type: Number, required: true, min: 1 },
            rank: { type: Number },
            _id: false
        }],

        newGenInterest: { type: Boolean, default: false },
        collegeTypePreference: {
            type: String,
            enum: ["prefer_new_gen", "neutral", "prefer_traditional"],
            default: null
        }
    },

    // Legacy / top-level fields
    state: String,
    city: String,
    country: String,
    class_level: String,

    target_degree: {
        type: [String], // Updated to array
        default: []
    },

    college_type_aspiring: [String],
    preferred_countries: [String],
    target_exams: [String],

    saved_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    saved_international_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InternationalCollege' }],
    saved_newgen_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewGenCollege' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
    this.updatedAt = new Date();
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
