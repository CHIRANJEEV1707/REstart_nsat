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
}, { timestamps: true });

export default mongoose.model<IBundle>('Bundle', BundleSchema);
