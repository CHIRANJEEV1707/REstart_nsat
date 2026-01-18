import mongoose, { Model } from 'mongoose';

export interface ITestAttempt {
    userId: mongoose.Types.ObjectId;
    mockTestId: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt: Date | null;
    status: 'in-progress' | 'completed' | 'abandoned';
    answers: {
        questionId: mongoose.Types.ObjectId;
        selectedAnswer: string;
        isCorrect: boolean;
        isVerified: boolean;
        marksAwarded: number;
        timeSpent: number;
    }[];
    totalScore: number;
    maxScore: number;
    percentage: number;
    totalTimeSpent: number;
    timeAllowed: number;
    cameraEnabled: boolean;
    violations: { type: string; timestamp: Date }[];
    totalViolations: number;
    proctoringSummary: { tabSwitches: number; fullscreenExits: number; windowBlurs: number };
    analytics: {
        sectionWise: { section: string; score: number; maxScore: number; correct: number; incorrect: number; unattempted: number; timeSpent: number; accuracy: number }[];
        percentile: number;
        rank: number;
        accuracy: number; // Added accuracy
        totalParticipants: number;
        weakAreas: string[];
        strongAreas: string[];
        recommendations: string[];
    };
}

const TestAttemptSchema = new mongoose.Schema<ITestAttempt>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress', index: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedAnswer: { type: String, default: '' },
        isCorrect: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        marksAwarded: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        _id: false
    }],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    timeAllowed: { type: Number, default: 0 },
    cameraEnabled: { type: Boolean, default: false },
    violations: [{ type: { type: String }, timestamp: { type: Date, default: Date.now }, _id: false }],
    totalViolations: { type: Number, default: 0 },
    proctoringSummary: { tabSwitches: { type: Number, default: 0 }, fullscreenExits: { type: Number, default: 0 }, windowBlurs: { type: Number, default: 0 } },
    analytics: {
        sectionWise: [{ section: String, score: Number, maxScore: Number, correct: Number, incorrect: Number, unattempted: Number, timeSpent: Number, accuracy: Number, _id: false }],
        percentile: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 }, // Added accuracy
        totalParticipants: { type: Number, default: 0 },
        weakAreas: [String],
        strongAreas: [String],
        recommendations: [String]
    }
}, { timestamps: true });

TestAttemptSchema.index({ userId: 1, mockTestId: 1 });
TestAttemptSchema.index({ mockTestId: 1, status: 1, totalScore: -1 });

const TestAttempt: Model<ITestAttempt> = mongoose.models.TestAttempt || mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);
export default TestAttempt;
