import mongoose, { Document, Schema } from 'mongoose';

export interface IInternationalCollege extends Document {
    name: string;
    country: string;
    city: string;
    continent: string;
    university_type: 'Public' | 'Private';
    description: string;
    official_website: string;
    global_ranking: number;
    ranking_body: 'QS' | 'THE' | 'US News';
    acceptance_rate: number;
    restart_score: number;
    degrees_offered: string[];
    entrance_exams: string[];
    english_tests: string[];
    minimum_scores: {
        sat: number;
        act: number;
        ielts: number;
        toefl: number;
    };
    tuition_fee_annual: number;
    living_cost_annual: number;
    application_fee: number;
    scholarships_available: boolean;
    scholarships: {
        name: string;
        amount: string;
        criteria: string;
    }[];
    visa_type: string;
    application_deadlines: {
        fall: Date;
        spring: Date;
    };
    application_portal_url: string;
    required_documents: string[];
    badges: string[];
    isTrending: boolean;
    trendingScore: number;
    image?: string; // Add image as optional if used in controller
}

const InternationalCollegeSchema: Schema = new Schema({
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

    // 🔹 Image
    image: { type: String },

    // 🔹 Trending
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for filters
InternationalCollegeSchema.index({ country: 1, global_ranking: 1 });
InternationalCollegeSchema.index({ tuition_fee_annual: 1 });

const InternationalCollege = mongoose.model<IInternationalCollege>('InternationalCollege', InternationalCollegeSchema);

export default InternationalCollege;
