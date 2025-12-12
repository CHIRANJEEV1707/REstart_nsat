import mongoose from 'mongoose';

const InternationalCollegeSchema = new mongoose.Schema({
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
    badges: [{ type: String }] // e.g. ["Ivy League", "Top 10 Global"]

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for filters
InternationalCollegeSchema.index({ country: 1, global_ranking: 1 });
InternationalCollegeSchema.index({ tuition_fee_annual: 1 });

const InternationalCollege = mongoose.model('InternationalCollege', InternationalCollegeSchema);

export default InternationalCollege;
