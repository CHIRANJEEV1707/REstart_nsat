import mongoose, { Document, Schema } from 'mongoose';

export interface IBundle extends Document {
    title: string;
    slug: string;
    description: string;
    exam: string;
    tags: string[];
    features: string[];
    price: number;
    currency: string;
    validityDays: number;
    isActive: boolean;
    // Tier-based access
    tier: 'basic' | 'core' | 'premium';
    variant: 'general' | 'coding' | 'combined';
    mocksIncluded: number;
    pyqsIncluded: number;
    interviewQuestionsIncluded: boolean;
    whatsappGroupLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BundleSchema = new Schema<IBundle>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    exam: { type: String, required: true },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    validityDays: { type: Number, default: 365 },
    isActive: { type: Boolean, default: true, index: true },
    // Tier-based access
    tier: {
        type: String,
        enum: ['basic', 'core', 'premium'],
        required: true,
        index: true
    },
    variant: {
        type: String,
        enum: ['general', 'coding', 'combined'],
        default: 'combined',
        index: true
    },
    mocksIncluded: { type: Number, default: 0 },
    pyqsIncluded: { type: Number, default: 0 },
    interviewQuestionsIncluded: { type: Boolean, default: false },
    whatsappGroupLink: { type: String }
}, { timestamps: true });

export default mongoose.model<IBundle>('Bundle', BundleSchema);

