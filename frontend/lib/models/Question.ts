import mongoose, { Model } from 'mongoose';

export interface ITestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
}

export interface IQuestion {
    mockTestId: mongoose.Types.ObjectId;
    section: string;
    questionNumber: number;
    questionText: string;
    questionType: 'mcq' | 'coding' | 'subjective';
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    marks: number;
    negativeMarks: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    // Coding-specific fields
    isCoding: boolean;
    functionName?: string;  // e.g., "isPrime", "secondLargest"
    constraints?: string;   // e.g., "1 <= N <= 10^6"
    timeLimit?: number;     // in seconds
    memoryLimit?: number;   // in MB
    codeTemplate: { language: string; template: string }[];
    testCases: ITestCase[];
}

const QuestionSchema = new mongoose.Schema<IQuestion>({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    section: { type: String, required: true, index: true },
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'coding', 'subjective'], default: 'mcq' },
    options: [{ id: String, text: String, _id: false }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    marks: { type: Number, required: true, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    isCoding: { type: Boolean, default: false },
    codeTemplate: [{ language: String, template: String, _id: false }],
    testCases: [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false }, _id: false }]
}, { timestamps: true });

QuestionSchema.index({ mockTestId: 1, section: 1, questionNumber: 1 });

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;
