import mongoose, { Model } from 'mongoose';

export interface IJEEQuestionBank {
    subject: 'Mathematics' | 'Physics' | 'Chemistry';
    chapter: string;
    questionNumber: number;
    year: number;
    shift: string;
    questionText: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    isInteger: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
}

const JEEQuestionBankSchema = new mongoose.Schema<IJEEQuestionBank>({
    subject: {
        type: String,
        enum: ['Mathematics', 'Physics', 'Chemistry'],
        required: true,
        index: true
    },
    chapter: { type: String, required: true, index: true },
    questionNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    shift: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ id: String, text: String, _id: false }],
    correctAnswer: { type: String, default: '' },
    isInteger: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }]
}, { timestamps: true });

JEEQuestionBankSchema.index({ subject: 1, questionNumber: 1 }, { unique: true });

const JEEQuestionBank: Model<IJEEQuestionBank> = mongoose.models.JEEQuestionBank ||
    mongoose.model<IJEEQuestionBank>('JEEQuestionBank', JEEQuestionBankSchema);

export default JEEQuestionBank;
