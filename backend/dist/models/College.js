"use strict";
const mongoose = require('mongoose');
const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    location: {
        state: { type: String, required: true },
        city: { type: String, required: true }
    },
    type: { type: String, enum: ['Public', 'Private'], required: true },
    fees: { type: Number, required: true }, // Annual fee in INR
    exams_required: [{ type: String, index: true }], // e.g. ["JEE Main", "MHT CET"]
    restart_score: { type: Number, min: 0, max: 10, index: true },
    badges: [String], // e.g. ["Top Ranked", "Best ROI"]
    description: String,
    website: String,
    placement_stats: {
        average_package: String,
        highest_package: String
    },
    admission_process: [String] // Array of steps for "How to Get In"
});
// Full text search index
CollegeSchema.index({ name: 'text', 'location.city': 'text', 'location.state': 'text', description: 'text' });
module.exports = mongoose.model('College', CollegeSchema);
