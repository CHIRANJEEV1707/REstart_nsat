import mongoose from 'mongoose';

const PrepPlanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
    weeks: [{
        weekNumber: Number,
        subjects: {
            Physics: [String], // List of topics/tasks
            Chemistry: [String],
            Math: [String]
        },
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Compound index for user's active plans
PrepPlanSchema.index({ user: 1, status: 1 });

const PrepPlan = mongoose.model('PrepPlan', PrepPlanSchema);
export default PrepPlan;
