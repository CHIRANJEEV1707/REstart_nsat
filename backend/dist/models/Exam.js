"use strict";
const mongoose = require('mongoose');
const ExamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true }, // e.g. JEEMAIN
    description: String,
    dates: {
        registration_start: Date,
        registration_end: Date,
        exam_date_start: Date,
        exam_date_end: Date
    },
    eligibility: String,
    syllabus_url: String,
    website: String
});
module.exports = mongoose.model('Exam', ExamSchema);
