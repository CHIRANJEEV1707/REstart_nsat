import mongoose, { Document, Schema } from 'mongoose';

export interface IMockTest extends Document {
    title: string;
    slug: string;
    description: string;
    examType: 'nsat' | 'coding-nsat' | 'neet' | 'ugee' | 'jee-mains' | 'jee-advanced' | 'bitsat';
    duration: number; // in minutes
    totalMarks: number;
    passingMarks: number;
    sections: {
        name: string;
        questionCount: number;
        marks: number;
    }[];
    instructions: string[];
    isFree: boolean;
    isPremium: boolean;
    requiredBundle: 'free' | 'premium';
    isActive: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    // PYQ specific fields
    isPYQ: boolean;
    year?: number;
    shift?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const MockTestSchema = new Schema<IMockTest>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    examType: {
        type: String,
        enum: ['nsat', 'coding-nsat', 'neet', 'ugee', 'jee-mains', 'jee-advanced', 'bitsat'],
        required: true,
        index: true
    },
    duration: { type: Number, required: true }, // in minutes
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, default: 0 },
    sections: [{
        name: { type: String, required: true },
        questionCount: { type: Number, required: true },
        marks: { type: Number, required: true },
        _id: false
    }],
    instructions: [{ type: String }],
    isFree: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: true },
    requiredBundle: { type: String, enum: ['free', 'premium'], default: 'premium', index: true },
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
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IMockTest>('MockTest', MockTestSchema);
