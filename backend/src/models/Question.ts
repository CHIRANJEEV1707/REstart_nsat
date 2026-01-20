import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
    mockTestId: mongoose.Types.ObjectId;
    section: string;
    questionNumber: number;
    questionText: string;
    questionType: 'mcq' | 'coding' | 'subjective';
    options: {
        id: string;
        text: string;
    }[];
    correctAnswer: string; // option id for MCQ, or expected output for coding
    explanation: string;
    marks: number;
    negativeMarks: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    // Topic-wise analysis
    subject?: string;
    chapter?: string;
    topic?: string;
    // Coding-specific fields
    isCoding: boolean;
    constraints?: string;
    codeTemplate: {
        language: string;
        template: string;
    }[];
    testCases: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
    mockTestId: {
        type: Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true,
        index: true
    },
    section: { type: String, required: true, index: true },
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ['mcq', 'coding', 'subjective'],
        default: 'mcq'
    },
    options: [{
        id: { type: String, required: true },
        text: { type: String, required: true },
        _id: false
    }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    marks: { type: Number, required: true, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [{ type: String }],
    // Topic-wise fields
    subject: { type: String, index: true },
    chapter: { type: String, index: true },
    topic: { type: String },
    // Coding-specific
    isCoding: { type: Boolean, default: false },
    constraints: { type: String },
    codeTemplate: [{
        language: { type: String },
        template: { type: String },
        _id: false
    }],
    testCases: [{
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false },
        _id: false
    }]
}, { timestamps: true });

// Compound index for efficient queries
QuestionSchema.index({ mockTestId: 1, section: 1, questionNumber: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
