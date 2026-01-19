import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserExamProgress extends Document {
  user: mongoose.Types.ObjectId;
  examId: string;

  // Progress Stats
  streak: {
    current: number;
    max: number;
    lastPracticeDate: Date | null;
  };

  // Performance Stats
  totalQuestionsSolved: number;
  accuracy: number; // Percentage 0-100
  averageTimePerQuestion: number; // Seconds

  // Latest Mock/Score Snapshot
  latestScore: {
    score: number;
    total: number;
    percentile?: number; // Calculated server-side or provided
    date: Date;
  } | null;

  lastSession: {
    score: number;
    totalScore: number;
    timeTaken: number; // seconds
    date: Date;
    answers: {
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }[];
  } | null;

  createdAt: Date;
  updatedAt: Date;
}

const UserExamProgressSchema = new Schema<IUserExamProgress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  examId: { type: String, required: true, index: true }, // e.g., 'jee-mains', 'bitsat'

  streak: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    lastPracticeDate: { type: Date, default: null }
  },

  totalQuestionsSolved: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageTimePerQuestion: { type: Number, default: 0 },

  latestScore: {
    score: { type: Number },
    total: { type: Number },
    percentile: { type: Number },
    date: { type: Date, default: Date.now }
  },

  lastSession: {
    score: { type: Number },
    totalScore: { type: Number },
    timeTaken: { type: Number },
    date: { type: Date },
    answers: [{
      questionId: { type: String },
      selectedOptionId: { type: String },
      isCorrect: { type: Boolean }
    }]
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per exam per user
UserExamProgressSchema.index({ user: 1, examId: 1 }, { unique: true });

// Prevent model recompilation in serverless environment
const UserExamProgress: Model<IUserExamProgress> = mongoose.models.UserExamProgress || mongoose.model<IUserExamProgress>('UserExamProgress', UserExamProgressSchema);

export default UserExamProgress;
