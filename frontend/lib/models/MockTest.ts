import mongoose, { Model } from 'mongoose';

export interface IMockTest {
    title: string;
    slug: string;
    description: string;
    examType: 'nsat' | 'coding-nsat';
    duration: number;
    totalMarks: number;
    passingMarks: number;
    sections: { name: string; questionCount: number; marks: number }[];
    instructions: string[];
    isFree: boolean;
    isPremium: boolean;
    isActive: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    isPYQ: boolean;
    year?: number;
    shift?: string;
    order: number;
    // Bundle access control
    requiredBundle: 'free' | 'basic' | 'core' | 'premium';
    testCategory: 'general' | 'coding';
}

const MockTestSchema = new mongoose.Schema<IMockTest>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    examType: { type: String, enum: ['nsat', 'coding-nsat'], required: true, index: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, default: 0 },
    sections: [{ name: String, questionCount: Number, marks: Number, _id: false }],
    instructions: [{ type: String }],
    isFree: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    // PYQ specific fields
    isPYQ: { type: Boolean, default: false, index: true },
    year: { type: Number },
    shift: { type: String },
    order: { type: Number, default: 0 },
    // Bundle access control
    requiredBundle: {
        type: String,
        enum: ['free', 'basic', 'core', 'premium'],
        default: 'free',
        index: true
    },
    testCategory: {
        type: String,
        enum: ['general', 'coding'],
        default: 'general',
        index: true
    }
}, { timestamps: true });

const MockTest: Model<IMockTest> = mongoose.models.MockTest || mongoose.model<IMockTest>('MockTest', MockTestSchema);
export default MockTest;
