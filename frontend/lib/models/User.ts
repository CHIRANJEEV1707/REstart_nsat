import mongoose, { Document, Schema, Model } from 'mongoose';
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
        goal?: 'BTech' | 'MS' | 'MBA';
        budget?: {
            currency: 'INR' | 'USD';
            amount: number;
        };
        preferredCountries?: string[];
        preferredStates?: string[];
        examScores?: {
            exam: string;
            score: number;
            fullMarks: number;
            rank?: number;
        }[];
        collegeTypes?: string[];
        targetDegree?: string[];
        newGenInterest?: boolean;
        collegeTypePreference?: 'prefer_new_gen' | 'neutral' | 'prefer_traditional';
        budgetMin?: number;
        budgetMax?: number;
    };
    state?: string;
    city?: string;
    country?: string;
    class_level?: string;
    target_degree?: string[];
    college_type_aspiring?: string[];
    preferred_countries?: string[];
    target_exams?: string[];
    saved_colleges?: mongoose.Types.ObjectId[];
    saved_international_colleges?: mongoose.Types.ObjectId[];
    saved_newgen_colleges?: mongoose.Types.ObjectId[];
    purchasedBundles: {
        bundleId: mongoose.Types.ObjectId;
        purchasedAt: Date;
        orderId: string;
        paymentId: string;
    }[];
    failedLoginAttempts: number;
    lockUntil: Date | null;
    // Password reset fields
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
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
        budget: {
            currency: { type: String, enum: ['INR', 'USD'], default: 'INR' },
            amount: { type: Number, required: false }
        },
        preferredCountries: [String],
        preferredStates: [String],
        collegeTypes: [String],
        targetDegree: { type: [String], default: [] },
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

    state: String,
    city: String,
    country: String,
    class_level: String,
    target_degree: { type: [String], default: [] },
    college_type_aspiring: [String],
    preferred_countries: [String],
    target_exams: [String],

    saved_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    saved_international_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InternationalCollege' }],
    saved_newgen_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewGenCollege' }],

    purchasedBundles: [{
        bundleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },
        purchasedAt: { type: Date, default: Date.now },
        orderId: String,
        paymentId: String,
        _id: false
    }],

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Password reset fields
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

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
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent model recompilation in serverless environment
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
