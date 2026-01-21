
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
// import { fileURLToPath } from 'url';
import Bundle from './src/models/Bundle'; // Ensure this model has the 'variant' field updated

// Load env explicity from current dir
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    // process.exit(1); // Don't exit yet to see debug
} else {
    console.log('Using MongoDB URI:', MONGODB_URI.split('@')[1]); // Log safe part
}

const bundles = [
    // --- BASIC TIER ---
    {
        title: 'NSAT Basic - General Only',
        slug: 'nsat-basic-general',
        description: 'Focus on General Aptitude and Math for NSAT.',
        exam: 'NSAT',
        tags: ['General', 'Math', 'Basic'],
        features: ['3 General Mock Tests', '3 General PYQ Papers', 'Interview Basics'],
        price: 300,
        currency: 'INR',
        tier: 'basic',
        variant: 'general',
        mocksIncluded: 3,
        isActive: true
    },
    {
        title: 'NSAT Basic - Coding Only',
        slug: 'nsat-basic-coding',
        description: 'Focus on Coding and Logic for NSAT.',
        exam: 'NSAT',
        tags: ['Coding', 'Logic', 'Basic'],
        features: ['3 Coding Mock Tests', '3 Coding PYQ Papers', 'Logic Basics'],
        price: 300,
        currency: 'INR',
        tier: 'basic',
        variant: 'coding',
        mocksIncluded: 3,
        isCoding: true,
        isActive: true
    },
    {
        title: 'NSAT Basic Pack', // Combined
        slug: 'nsat-basic', // Existing slug maps to Combined
        description: 'Complete Basic preparation for NSAT.',
        exam: 'NSAT',
        tags: ['General', 'Coding', 'Basic'],
        features: ['3 Full Mock Tests (Gen + Code)', '3 Real PYQ Papers', 'Interview Question Bank', 'Detailed Solutions'],
        price: 500,
        currency: 'INR',
        tier: 'basic',
        variant: 'combined',
        mocksIncluded: 6,
        isActive: true
    },

    // --- CORE TIER ---
    {
        title: 'NSAT Core - General Only',
        slug: 'nsat-core-general',
        description: 'Advanced General Aptitude preparation.',
        exam: 'NSAT',
        tags: ['General', 'Math', 'Core'],
        features: ['5 General Mock Tests', '5 General PYQ Papers', 'Community Access'],
        price: 500,
        currency: 'INR',
        tier: 'core',
        variant: 'general',
        mocksIncluded: 5,
        isActive: true
    },
    {
        title: 'NSAT Core - Coding Only',
        slug: 'nsat-core-coding',
        description: 'Advanced Coding preparation.',
        exam: 'NSAT',
        tags: ['Coding', 'Core'],
        features: ['5 Coding Mock Tests', '5 Coding PYQ Papers', 'Community Access'],
        price: 500,
        currency: 'INR',
        tier: 'core',
        variant: 'coding',
        mocksIncluded: 5,
        isActive: true
    },
    {
        title: 'NSAT Core Pack', // Combined
        slug: 'nsat-core', // Existing
        description: 'Comprehensive Core preparation.',
        exam: 'NSAT',
        tags: ['General', 'Coding', 'Core'],
        features: ['5 Mock Tests (Gen + Code)', '5 PYQ Papers', 'Exclusive WhatsApp Community', 'Priority Support'],
        price: 800,
        currency: 'INR',
        tier: 'core',
        variant: 'combined',
        mocksIncluded: 10,
        isActive: true
    },

    // --- PREMIUM TIER ---
    {
        title: 'NSAT Premium - General Only',
        slug: 'nsat-premium-general',
        description: 'Mastery in General Aptitude.',
        exam: 'NSAT',
        tags: ['General', 'Premium'],
        features: ['10 General Mock Tests', 'All General PYQs', '1-on-1 Access'],
        price: 800,
        currency: 'INR',
        tier: 'premium',
        variant: 'general',
        mocksIncluded: 10,
        isActive: true
    },
    {
        title: 'NSAT Premium - Coding Only',
        slug: 'nsat-premium-coding',
        description: 'Mastery in Coding.',
        exam: 'NSAT',
        tags: ['Coding', 'Premium'],
        features: ['10 Coding Mock Tests', 'All Coding PYQs', 'Code Reviews'],
        price: 800,
        currency: 'INR',
        tier: 'premium',
        variant: 'coding',
        mocksIncluded: 10,
        isActive: true
    },
    {
        title: 'NSAT Premium Pack', // Combined
        slug: 'nsat-premium', // Existing
        description: 'The ultimate preparation package.',
        exam: 'NSAT',
        tags: ['General', 'Coding', 'Premium'],
        features: ['All 20 Mock Tests', 'All PYQ Papers', 'VIP WhatsApp Group', 'Priority Interview Scheduling', '1-on-1 Doubt Support'],
        price: 1000,
        currency: 'INR',
        tier: 'premium',
        variant: 'combined',
        mocksIncluded: 20,
        isActive: true
    }
];

async function seedVariants() {
    try {
        console.log('Connecting to DB...', MONGODB_URI ? MONGODB_URI.split('@')[1] : 'undefined');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        for (const bundle of bundles) {
            console.log(`Upserting ${bundle.title} (${bundle.slug}) - Price: ${bundle.price}...`);
            await Bundle.findOneAndUpdate(
                { slug: bundle.slug },
                { ...bundle },
                { upsert: true, new: true }
            );
        }

        console.log('Bundles seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding bundles:', error);
        process.exit(1);
    }
}

seedVariants();
