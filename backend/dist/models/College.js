"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CollegeSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, index: true },
    location: {
        state: { type: String, required: true },
        city: { type: String, required: true }
    },
    type: { type: String, enum: ['Public', 'Private', 'IIIT', 'GFTI', 'Public Research University', 'Public Research Institute', 'Public Deemed University', 'Private Deemed University', 'Deemed University', 'Central University', 'Institute of National Importance', 'State University', 'University Department', 'Central Institute', 'State-Aided Autonomous', 'State University Campus', 'State Government College', 'State Government Aided', 'Private Autonomous', 'Private University'], required: true },
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
    admission_process: [String], // Array of steps for "How to Get In"
    // International Fields
    country: { type: String, default: 'India', index: true },
    isNewGen: { type: Boolean, default: false, index: true }, // NEW: To strictly separate New-Gen from Traditional
    image: { type: String }, // NEW: Hero image for the college card
    study_abroad_info: {
        visa_requirements: [String],
        english_proficiency: [String], // e.g. ["IELTS 7.0", "TOEFL 100"]
        scholarships_available: [String]
    },
    // 🔹 Trending
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true }
});
// Full text search index
CollegeSchema.index({ name: 'text', 'location.city': 'text', 'location.state': 'text', description: 'text' });
const College = mongoose_1.default.model('College', CollegeSchema);
exports.default = College;
