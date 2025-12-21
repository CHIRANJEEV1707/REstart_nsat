"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const InternationalCollegeSchema = new mongoose_1.Schema({
    // 🔹 Basic Info
    name: { type: String, required: true, index: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    continent: { type: String, required: true },
    university_type: { type: String, enum: ['Public', 'Private'], required: true },
    description: { type: String, required: true },
    official_website: { type: String, required: true },
    // 🔹 Rankings & Reputation
    global_ranking: { type: Number, required: true, index: true },
    ranking_body: { type: String, enum: ['QS', 'THE', 'US News'], required: true },
    acceptance_rate: { type: Number, required: true }, // Percentage (0-100)
    restart_score: { type: Number, min: 0, max: 10, required: true, index: true },
    // 🔹 Academics & Exams
    degrees_offered: [{ type: String, required: true }], // e.g. ["B.Tech", "BSc"]
    entrance_exams: [{ type: String }], // e.g. ["SAT", "ACT"]
    english_tests: [{ type: String, required: true }], // e.g. ["IELTS", "TOEFL"]
    minimum_scores: {
        sat: { type: Number, default: 0 },
        act: { type: Number, default: 0 },
        ielts: { type: Number, default: 0 },
        toefl: { type: Number, default: 0 }
    },
    // 🔹 Fees & Cost (USD)
    tuition_fee_annual: { type: Number, required: true },
    living_cost_annual: { type: Number, required: true },
    application_fee: { type: Number, required: true },
    scholarships_available: { type: Boolean, default: false },
    scholarships: [{
            name: String,
            amount: String, // e.g. "Up to $10,000"
            criteria: String
        }],
    // 🔹 Visa & Application
    visa_type: { type: String, required: true }, // e.g. "F1", "Tier 4"
    application_deadlines: {
        fall: { type: Date },
        spring: { type: Date }
    },
    application_portal_url: { type: String, required: true },
    required_documents: [{ type: String, required: true }], // e.g. ["SOP", "LOR"]
    // 🔹 Metadata
    badges: [{ type: String }], // e.g. ["Ivy League", "Top 10 Global"]
    // 🔹 Trending
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true } // Removed image field from schema for now as it wasn't there, or should I add it? Controller asks for image. I'll stick to interface only or add to schema if logic requires.
    // Actually, controller projects 'image'. The schema doesn't have 'image'. 
    // Wait, the trendingController uses `.select('... image ...')`. If international doesn't have image, it returns undefined.
    // The previous error was specifically about `isTrending`. 
    // Let's add `image` to schema too while we are here, to support the feature fully.
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
// Indexes for filters
InternationalCollegeSchema.index({ country: 1, global_ranking: 1 });
InternationalCollegeSchema.index({ tuition_fee_annual: 1 });
const InternationalCollege = mongoose_1.default.model('InternationalCollege', InternationalCollegeSchema);
exports.default = InternationalCollege;
