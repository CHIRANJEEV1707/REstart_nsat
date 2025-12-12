"use strict";
const mongoose = require('mongoose');
const PrepPlanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
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
module.exports = mongoose.model('PrepPlan', PrepPlanSchema);
