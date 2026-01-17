import mongoose, { Document, Schema } from 'mongoose';

export interface IPYQQuestion extends Document {
    categoryId: mongoose.Types.ObjectId;
    questionNumber: number;
    section: string;
    questionText: string;
    options: {
        id: string;
        text: string;
    }[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PYQQuestionSchema = new Schema<IPYQQuestion>({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'PYQCategory',
        required: true,
        index: true
    },
    questionNumber: { type: Number, required: true },
    section: { type: String, default: 'General' },
    questionText: { type: String, required: true },
    options: [{
        id: { type: String, required: true },
        text: { type: String, required: true },
        _id: false
    }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{ type: String }]
}, { timestamps: true });

// Compound index
PYQQuestionSchema.index({ categoryId: 1, questionNumber: 1 });

export default mongoose.model<IPYQQuestion>('PYQQuestion', PYQQuestionSchema);
