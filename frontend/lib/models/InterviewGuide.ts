import mongoose, { Model } from 'mongoose';

export interface IInterviewGuide {
    title: string;
    slug: string;
    guideType: 'nsat' | 'coding';
    description: string;
    content: string;
    tips: string[];
    sampleQuestions: { question: string; suggestedAnswer: string; category: string }[];
    isFree: boolean;
    isActive: boolean;
    order: number;
}

const InterviewGuideSchema = new mongoose.Schema<IInterviewGuide>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    guideType: { type: String, enum: ['nsat', 'coding'], required: true, index: true },
    description: { type: String, default: '' },
    content: { type: String, required: true },
    tips: [{ type: String }],
    sampleQuestions: [{ question: String, suggestedAnswer: String, category: String, _id: false }],
    isFree: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const InterviewGuide: Model<IInterviewGuide> = mongoose.models.InterviewGuide || mongoose.model<IInterviewGuide>('InterviewGuide', InterviewGuideSchema);
export default InterviewGuide;
