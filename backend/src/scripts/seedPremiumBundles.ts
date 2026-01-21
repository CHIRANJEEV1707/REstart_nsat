// Seed script for Premium Bundles, Mocks, and PYQs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

// Define schemas inline to avoid import issues
const BundleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    exam: { type: String, required: true },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    validityDays: { type: Number, default: 365 },
    isActive: { type: Boolean, default: true },
    tier: { type: String, enum: ['basic', 'core', 'premium'], required: true },
    mocksIncluded: { type: Number, default: 0 },
    pyqsIncluded: { type: Number, default: 0 },
    interviewQuestionsIncluded: { type: Boolean, default: false },
    whatsappGroupLink: { type: String }
}, { timestamps: true });

const MockTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    examType: { type: String, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, default: 0 },
    sections: [{ name: String, questionCount: Number, marks: Number }],
    instructions: [{ type: String }],
    isFree: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    difficulty: { type: String, default: 'medium' },
    isPYQ: { type: Boolean, default: false },
    year: { type: Number },
    shift: { type: String },
    order: { type: Number, default: 0 },
    requiredBundle: { type: String, enum: ['free', 'basic', 'core', 'premium'], default: 'free' },
    testCategory: { type: String, enum: ['general', 'coding'], default: 'general' }
}, { timestamps: true });

const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema);
const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);

async function seedBundles() {
    console.log('Seeding Bundles...');

    const bundles = [
        {
            title: 'Basic Pack',
            slug: 'nsat-basic',
            description: 'Start your NSAT preparation with essential resources',
            exam: 'NSAT',
            tier: 'basic',
            price: 300,
            features: [
                '3 Full Mock Tests (General + Coding)',
                '3 Real PYQ Papers',
                'Interview Question Bank'
            ],
            mocksIncluded: 3,
            pyqsIncluded: 3,
            interviewQuestionsIncluded: true
        },
        {
            title: 'Core Pack',
            slug: 'nsat-core',
            description: 'Serious about success? Get comprehensive preparation.',
            exam: 'NSAT',
            tier: 'core',
            price: 500,
            features: [
                '5 Mock Tests (General + Coding)',
                '5 PYQ Papers',
                'Exclusive WhatsApp Community',
                'Interview Coordination Support'
            ],
            mocksIncluded: 5,
            pyqsIncluded: 5,
            interviewQuestionsIncluded: true,
            whatsappGroupLink: 'https://chat.whatsapp.com/Dv5cSSZUPeC7egTbJ43fwF'
        },
        {
            title: 'Premium Pack',
            slug: 'nsat-premium',
            description: 'Maximum preparation for maximum results',
            exam: 'NSAT',
            tier: 'premium',
            price: 800,
            features: [
                'All 20 Mock Tests (10 General + 10 Coding)',
                'All PYQ Papers',
                'VIP WhatsApp Group',
                'Priority Interview Scheduling'
            ],
            mocksIncluded: 20,
            pyqsIncluded: 10,
            interviewQuestionsIncluded: true,
            whatsappGroupLink: 'https://chat.whatsapp.com/FSGst6uURfRDCjUwPe8kof'
        }
    ];

    for (const bundle of bundles) {
        await Bundle.findOneAndUpdate(
            { slug: bundle.slug },
            bundle,
            { upsert: true, new: true }
        );
        console.log(`  ✓ ${bundle.title} (₹${bundle.price})`);
    }
}

async function updateExistingMocks() {
    console.log('\\nUpdating existing mocks with bundle info...');

    // Update NSAT General Mock 01 (existing) - Free
    await MockTest.findOneAndUpdate(
        { slug: 'nsat-general-full-mock-01' },
        { requiredBundle: 'free', testCategory: 'general' }
    );

    // Update NSAT Coding Mock 01 (existing) - Free
    await MockTest.findOneAndUpdate(
        { slug: 'nsat-coding-full-mock-01' },
        { requiredBundle: 'free', testCategory: 'coding' }
    );

    console.log('  ✓ Updated existing mocks');
}

async function seedNewMocks() {
    console.log('\\nSeeding new mock tests...');

    const categories = ['general', 'coding'] as const;
    const bundleTiers = [
        { tier: 'basic', mocks: [2, 3] },
        { tier: 'core', mocks: [4, 5] },
        { tier: 'premium', mocks: [6, 7, 8, 9, 10] }
    ];

    for (const category of categories) {
        for (const { tier, mocks } of bundleTiers) {
            for (const num of mocks) {
                const slug = `nsat-${category}-full-mock-${String(num).padStart(2, '0')}`;
                const examType = category === 'coding' ? 'coding-nsat' : 'nsat';

                await MockTest.findOneAndUpdate(
                    { slug },
                    {
                        title: `NSAT ${category === 'coding' ? 'Coding' : 'General'} Full Mock Test ${String(num).padStart(2, '0')}`,
                        slug,
                        description: `Complete NSAT ${category === 'coding' ? 'Coding' : 'General'} mock test with realistic exam experience.`,
                        examType,
                        duration: category === 'coding' ? 180 : 180,
                        totalMarks: category === 'coding' ? 280 : 320,
                        passingMarks: 0,
                        sections: category === 'coding'
                            ? [
                                { name: 'Learnability', questionCount: 10, marks: 40 },
                                { name: 'Pseudocoding', questionCount: 10, marks: 40 },
                                { name: 'Coding', questionCount: 6, marks: 200 }
                            ]
                            : [
                                { name: 'Mathematics (Class 10)', questionCount: 15, marks: 60 },
                                { name: 'Mathematics (Class 11-12)', questionCount: 15, marks: 60 },
                                { name: 'Logic & Data Interpretation', questionCount: 20, marks: 80 },
                                { name: 'Algorithmic Thinking', questionCount: 10, marks: 40 },
                                { name: 'Reading Comprehension', questionCount: 10, marks: 40 },
                                { name: 'Language Reasoning', questionCount: 10, marks: 40 }
                            ],
                        instructions: [
                            `Total duration: 180 minutes`,
                            `Marking: +4 for correct, -1 for incorrect`,
                            'Test is proctored via webcam and microphone'
                        ],
                        isFree: false,
                        isPremium: true,
                        isActive: true,
                        difficulty: 'medium',
                        isPYQ: false,
                        order: num,
                        requiredBundle: tier,
                        testCategory: category
                    },
                    { upsert: true, new: true }
                );
                console.log(`  ✓ NSAT ${category} Mock ${num} (${tier})`);
            }
        }
    }
}

async function seedPYQs() {
    console.log('\\nSeeding PYQ sets...');

    const pyqs = [
        // Basic tier PYQs
        { title: 'Newton Paper 2024 - Set 1', slug: 'newton-pyq-2024-set-1', tier: 'basic', order: 1 },
        { title: 'Newton Paper 2024 - Set 2', slug: 'newton-pyq-2024-set-2', tier: 'basic', order: 2 },
        { title: 'NSAT Mock Q&A Paper', slug: 'nsat-mock-qa-paper', tier: 'basic', order: 3 },
        // Core tier PYQs  
        { title: 'NSAT Phase 2 Paper', slug: 'nsat-phase-2-paper', tier: 'core', order: 4 },
        { title: 'NSAT Practice Set 2024', slug: 'nsat-practice-set-2024', tier: 'core', order: 5 },
        // Premium tier PYQs
        { title: 'Interview Questions Master Set', slug: 'interview-questions-master', tier: 'premium', order: 6 }
    ];

    for (const pyq of pyqs) {
        await MockTest.findOneAndUpdate(
            { slug: pyq.slug },
            {
                title: pyq.title,
                slug: pyq.slug,
                description: `Previous Year Questions from ${pyq.title}`,
                examType: 'nsat',
                duration: 180,
                totalMarks: 320,
                sections: [{ name: 'Questions', questionCount: 80, marks: 320 }],
                instructions: ['Practice with real previous year questions'],
                isFree: false,
                isPremium: true,
                isActive: true,
                difficulty: 'medium',
                isPYQ: true,
                order: pyq.order,
                requiredBundle: pyq.tier,
                testCategory: 'general'
            },
            { upsert: true, new: true }
        );
        console.log(`  ✓ ${pyq.title} (${pyq.tier})`);
    }
}

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!\\n');

        await seedBundles();
        await updateExistingMocks();
        await seedNewMocks();
        await seedPYQs();

        console.log('\\n✅ Seeding completed successfully!');
        console.log('\\nSummary:');
        console.log('  - 3 Bundle tiers (Basic/Core/Premium)');
        console.log('  - 20 Mock tests (10 General + 10 Coding)');
        console.log('  - 6 PYQ sets');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
