import mongoose, { Model } from 'mongoose';

export interface IPYQQuestion {
    categoryId: mongoose.Types.ObjectId;
    questionNumber: number;
    section: string;
    questionText: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
}

const PYQQuestionSchema = new mongoose.Schema<IPYQQuestion>({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PYQCategory', required: true, index: true },
    questionNumber: { type: Number, required: true },
    section: { type: String, default: 'General' },
    questionText: { type: String, required: true },
    options: [{ id: String, text: String, _id: false }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }]
}, { timestamps: true });

const PYQQuestion: Model<IPYQQuestion> = mongoose.models.PYQQuestion || mongoose.model<IPYQQuestion>('PYQQuestion', PYQQuestionSchema);
export default PYQQuestion;
