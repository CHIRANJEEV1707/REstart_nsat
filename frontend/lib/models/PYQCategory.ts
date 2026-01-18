import mongoose, { Model } from 'mongoose';

export interface IPYQCategory {
    title: string;
    slug: string;
    examType: 'nsat' | 'coding-nsat';
    year: number;
    description: string;
    questionCount: number;
    isFree: boolean;
    isActive: boolean;
    order: number;
}

const PYQCategorySchema = new mongoose.Schema<IPYQCategory>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    examType: { type: String, enum: ['nsat', 'coding-nsat', 'jee-mains', 'jee-advanced', 'bitsat'], required: true, index: true },
    year: { type: Number, required: true, index: true },
    description: { type: String, default: '' },
    questionCount: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const PYQCategory: Model<IPYQCategory> = mongoose.models.PYQCategory || mongoose.model<IPYQCategory>('PYQCategory', PYQCategorySchema);
export default PYQCategory;
