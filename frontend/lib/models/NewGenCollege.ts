import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INewGenCollege extends Document {
    name: string;
    shortName: string;
    location: {
        city: string;
        state: string;
        country: string;
    };
    degreeOffered: string[];
    category: string;
    examsAccepted: string[];
    fees: {
        amountINR: number;
        paymentModel: 'Upfront' | 'Income Share Agreement' | 'Hybrid';
    };
    cohortDetails: {
        batchSize: number;
        mode: 'Residential' | 'Hybrid';
    };
    curriculumFocus: string[];
    industryPartners: string[];
    placementSupport: {
        guaranteed: boolean;
        averageCTC?: number;
        highestCTC?: number;
    };
    admissionProcess: string[];
    highlights: string[];
    website: string;
    image: string;
    isActive: boolean;
    isTrending: boolean;
    trendingScore: number;
    createdAt: Date;
}

const NewGenCollegeSchema: Schema = new Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    location: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    degreeOffered: [{ type: String, default: ['B.Tech'] }],
    category: { type: String, default: 'New-Gen' },
    examsAccepted: [String],
    fees: {
        amountINR: { type: Number, required: true },
        paymentModel: {
            type: String,
            enum: ['Upfront', 'Income Share Agreement', 'Hybrid'],
            required: true
        }
    },
    cohortDetails: {
        batchSize: { type: Number },
        mode: { type: String, enum: ['Residential', 'Hybrid'], default: 'Residential' }
    },
    curriculumFocus: [String],
    industryPartners: [String],
    placementSupport: {
        guaranteed: { type: Boolean, default: false },
        averageCTC: { type: Number },
        highestCTC: { type: Number }
    },
    admissionProcess: [String],
    highlights: [String],
    website: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true }
}, {
    timestamps: true
});

const NewGenCollege: Model<INewGenCollege> = mongoose.models.NewGenCollege || mongoose.model<INewGenCollege>('NewGenCollege', NewGenCollegeSchema, 'newgen_colleges');

export default NewGenCollege;
