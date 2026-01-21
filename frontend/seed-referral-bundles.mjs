import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const BundleSchema = new mongoose.Schema({
    title: { type: String, required: true },
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

const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema);

const bundles = [
    {
        title: 'Basic Pack (General Only)',
        slug: 'nsat-basic-general',
        tier: 'basic',
        variant: 'general_only',
        description: 'Access to Basic Tier General Mock Tests and PYQs.',
        exam: 'NSAT',
        features: ['3 General Mocks', '3 General PYQs', 'Interview Questions'],
        price: 300, // Reduced price for single variant? Plan said Combined is 500.
        isActive: true
    },
    {
        title: 'Basic Pack (Coding Only)',
        slug: 'nsat-basic-coding',
        tier: 'basic',
        variant: 'coding_only',
        description: 'Access to Basic Tier Coding Mock Tests and PYQs.',
        exam: 'NSAT',
        features: ['3 Coding Mocks', '3 Coding PYQs', 'Interview Questions'],
        price: 300,
        isActive: true
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const b of bundles) {
            const exists = await Bundle.findOne({ slug: b.slug });
            if (!exists) {
                await Bundle.create(b);
                console.log(`Created: ${b.title}`);
            } else {
                // Update variant if missing
                if (!exists.variant) {
                    exists.variant = b.variant;
                    await exists.save();
                    console.log(`Updated variant for: ${b.title}`);
                } else {
                    console.log(`Exists: ${b.title}`);
                }
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding bundles:', error);
        process.exit(1);
    }
}

seed();
