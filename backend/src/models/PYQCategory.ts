import mongoose, { Document, Schema } from 'mongoose';

export interface IPYQCategory extends Document {
    title: string;
    slug: string;
    examType: 'nsat' | 'coding-nsat';
    year: number;
    description: string;
    questionCount: number;
    isFree: boolean;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const PYQCategorySchema = new Schema<IPYQCategory>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    examType: {
        type: String,
        enum: ['nsat', 'coding-nsat'],
        required: true,
        index: true
    },
    year: { type: Number, required: true, index: true },
    description: { type: String, default: '' },
    questionCount: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for sorting
PYQCategorySchema.index({ examType: 1, year: -1 });

export default mongoose.model<IPYQCategory>('PYQCategory', PYQCategorySchema);
