import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewGuide extends Document {
    title: string;
    slug: string;
    guideType: 'nsat' | 'coding';
    description: string;
    content: string; // Markdown content
    tips: string[];
    sampleQuestions: {
        question: string;
        suggestedAnswer: string;
        category: string;
    }[];
    isFree: boolean;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const InterviewGuideSchema = new Schema<IInterviewGuide>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    guideType: {
        type: String,
        enum: ['nsat', 'coding'],
        required: true,
        index: true
    },
    description: { type: String, default: '' },
    content: { type: String, required: true }, // Markdown
    tips: [{ type: String }],
    sampleQuestions: [{
        question: { type: String, required: true },
        suggestedAnswer: { type: String, default: '' },
        category: { type: String, default: 'General' },
        _id: false
    }],
    isFree: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for filtered listing
InterviewGuideSchema.index({ guideType: 1, isActive: 1, isFree: 1 });

export default mongoose.model<IInterviewGuide>('InterviewGuide', InterviewGuideSchema);
