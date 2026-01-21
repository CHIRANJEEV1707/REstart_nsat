import mongoose, { Document, Schema, Model } from 'mongoose';

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
    tier: string;
    variant: string;
    createdAt: Date;
    updatedAt: Date;
}

const BundleSchema = new Schema<IBundle>({
    title: { type: String, required: true }, // Tier-based access
    tier: {
        type: String,
        enum: ['basic', 'core', 'premium'],
        required: true,
        index: true
    },
    variant: {
        type: String,
        enum: ['combined', 'general_only', 'coding_only'],
        default: 'combined',
        index: true
    },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    exam: { type: String, required: true },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    validityDays: { type: Number, default: 365 },
    isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const Bundle: Model<IBundle> = mongoose.models.Bundle || mongoose.model<IBundle>('Bundle', BundleSchema);

export default Bundle;
