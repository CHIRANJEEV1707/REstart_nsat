import mongoose, { Document, Schema } from 'mongoose';

export interface IJEEQuestionBank extends Document {
    subject: 'Mathematics' | 'Physics' | 'Chemistry';
    chapter: string;
    questionNumber: number;
    year: number;
    shift: string;
    questionText: string;
    options: {
        id: string;
        text: string;
    }[];
    correctAnswer: string;
    isInteger: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const JEEQuestionBankSchema = new Schema<IJEEQuestionBank>({
    subject: {
        type: String,
        enum: ['Mathematics', 'Physics', 'Chemistry'],
        required: true,
        index: true
    },
    chapter: { type: String, required: true, index: true },
    questionNumber: { type: Number, required: true },
    year: { type: Number, required: true, index: true },
    shift: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{
        id: { type: String, required: true },
        text: { type: String, required: true },
        _id: false
    }],
    correctAnswer: { type: String, default: '' },
    isInteger: { type: Boolean, default: false },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{ type: String }]
}, { timestamps: true });

// Compound indexes for efficient queries
JEEQuestionBankSchema.index({ subject: 1, chapter: 1 });
JEEQuestionBankSchema.index({ subject: 1, questionNumber: 1 }, { unique: true });
JEEQuestionBankSchema.index({ subject: 1, year: -1 });

export default mongoose.model<IJEEQuestionBank>('JEEQuestionBank', JEEQuestionBankSchema);
