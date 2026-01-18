import mongoose, { Document, Schema } from 'mongoose';

export interface ITestAttempt extends Document {
    userId: mongoose.Types.ObjectId;
    mockTestId: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt: Date | null;
    status: 'in-progress' | 'completed' | 'abandoned';

    // Answers
    answers: {
        questionId: mongoose.Types.ObjectId;
        selectedAnswer: string;
        isCorrect: boolean;
        isVerified: boolean; // For coding questions (passed all test cases)
        marksAwarded: number;
        timeSpent: number; // seconds on this question
        status: 'not-visited' | 'visited' | 'answered' | 'marked-for-review' | 'answered-marked-for-review';
    }[];

    // Scoring
    totalScore: number;
    maxScore: number;
    percentage: number;

    // Time tracking
    totalTimeSpent: number; // in seconds
    timeAllowed: number; // in seconds

    // Proctoring violations
    cameraEnabled: boolean;
    violations: {
        type: 'tab_switch' | 'fullscreen_exit' | 'camera_disabled' | 'window_blur';
        timestamp: Date;
    }[];
    totalViolations: number;
    proctoringSummary: {
        tabSwitches: number;
        fullscreenExits: number;
        windowBlurs: number;
    };

    // Analytics (Premium feature)
    analytics: {
        sectionWise: {
            section: string;
            score: number;
            maxScore: number;
            correct: number;
            incorrect: number;
            unattempted: number;
            timeSpent: number;
            accuracy: number;
        }[];
        percentile: number;
        rank: number;
        totalParticipants: number;
        weakAreas: string[];
        strongAreas: string[];
        recommendations: string[];
    };

    createdAt: Date;
    updatedAt: Date;
}

const TestAttemptSchema = new Schema<ITestAttempt>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mockTestId: {
        type: Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true,
        index: true
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress',
        index: true
    },

    // Answers
    answers: [{
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedAnswer: { type: String, default: '' },
        isCorrect: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        marksAwarded: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['not-visited', 'visited', 'answered', 'marked-for-review', 'answered-marked-for-review'],
            default: 'not-visited'
        },
        _id: false
    }],

    // Scoring
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    // Time tracking
    totalTimeSpent: { type: Number, default: 0 },
    timeAllowed: { type: Number, default: 0 },

    // Proctoring
    cameraEnabled: { type: Boolean, default: false },
    violations: [{
        type: {
            type: String,
            enum: ['tab_switch', 'fullscreen_exit', 'camera_disabled', 'window_blur']
        },
        timestamp: { type: Date, default: Date.now },
        _id: false
    }],
    totalViolations: { type: Number, default: 0 },
    proctoringSummary: {
        tabSwitches: { type: Number, default: 0 },
        fullscreenExits: { type: Number, default: 0 },
        windowBlurs: { type: Number, default: 0 }
    },

    // Analytics
    analytics: {
        sectionWise: [{
            section: String,
            score: Number,
            maxScore: Number,
            correct: Number,
            incorrect: Number,
            unattempted: Number,
            timeSpent: Number,
            accuracy: Number,
            _id: false
        }],
        percentile: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        totalParticipants: { type: Number, default: 0 },
        weakAreas: [String],
        strongAreas: [String],
        recommendations: [String]
    }
}, { timestamps: true });

// Compound indexes
TestAttemptSchema.index({ userId: 1, mockTestId: 1 });
TestAttemptSchema.index({ mockTestId: 1, status: 1, totalScore: -1 }); // For leaderboard/ranking

export default mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);
