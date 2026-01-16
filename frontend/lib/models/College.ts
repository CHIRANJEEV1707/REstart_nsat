import mongoose, { Model } from 'mongoose';

export interface ICollege {
    name: string;
    location: {
        state: string;
        city: string;
    };
    type: string;
    fees: number;
    exams_required: string[];
    restart_score: number;
    badges: string[];
    description?: string;
    website?: string;
    placement_stats?: {
        average_package?: string;
        highest_package?: string;
    };
    admission_process?: string[];
    country: string;
    isNewGen: boolean;
    image?: string;
    study_abroad_info?: {
        visa_requirements?: string[];
        english_proficiency?: string[];
        scholarships_available?: string[];
    };
    isTrending: boolean;
    trendingScore: number;
}

const CollegeSchema = new mongoose.Schema<ICollege>({
    name: { type: String, required: true, index: true },
    location: {
        state: { type: String, required: true },
        city: { type: String, required: true }
    },
    type: {
        type: String,
        enum: ['Public', 'Private', 'IIIT', 'GFTI', 'Public Research University', 'Public Research Institute', 'Public Deemed University', 'Private Deemed University', 'Deemed University', 'Central University', 'Institute of National Importance', 'State University', 'University Department', 'Central Institute', 'State-Aided Autonomous', 'State University Campus', 'State Government College', 'State Government Aided', 'Private Autonomous', 'Private University'],
        required: true
    },
    fees: { type: Number, required: true },
    exams_required: [{ type: String, index: true }],
    restart_score: { type: Number, min: 0, max: 10, index: true },
    badges: [String],
    description: String,
    website: String,
    placement_stats: {
        average_package: String,
        highest_package: String
    },
    admission_process: [String],
    country: { type: String, default: 'India', index: true },
    isNewGen: { type: Boolean, default: false, index: true },
    image: { type: String },
    study_abroad_info: {
        visa_requirements: [String],
        english_proficiency: [String],
        scholarships_available: [String]
    },
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true }
});

// Full text search index
CollegeSchema.index({ name: 'text', 'location.city': 'text', 'location.state': 'text', description: 'text' });

const College: Model<ICollege> = mongoose.models.College || mongoose.model<ICollege>('College', CollegeSchema);

export default College;
