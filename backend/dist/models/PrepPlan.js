"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PrepPlanSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Exam', required: true },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    weeks: [{
            weekNumber: Number,
            subjects: {
                Physics: [String], // List of topics/tasks
                Chemistry: [String],
                Math: [String]
            },
            completed: { type: Boolean, default: false }
        }]
});
const PrepPlan = mongoose_1.default.model('PrepPlan', PrepPlanSchema);
exports.default = PrepPlan;
