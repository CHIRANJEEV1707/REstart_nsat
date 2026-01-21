// Simple seed script for Premium Bundles (ES Module)
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Bundle Schema
    const BundleSchema = new mongoose.Schema({
        title: String, slug: { type: String, unique: true }, description: String, exam: String,
        tags: [String], features: [String], price: Number, currency: { type: String, default: 'INR' },
        validityDays: { type: Number, default: 365 }, isActive: { type: Boolean, default: true },
        tier: { type: String, enum: ['basic', 'core', 'premium'] },
        mocksIncluded: Number, pyqsIncluded: Number, interviewQuestionsIncluded: Boolean, whatsappGroupLink: String
    }, { timestamps: true });

    const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema);

    // MockTest Schema  
    const MockTestSchema = new mongoose.Schema({
        title: String, slug: { type: String, unique: true }, description: String, examType: String,
        duration: Number, totalMarks: Number, passingMarks: { type: Number, default: 0 },
        sections: [{ name: String, questionCount: Number, marks: Number }],
        instructions: [String], isFree: { type: Boolean, default: false }, isPremium: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true }, difficulty: { type: String, default: 'medium' },
        isPYQ: { type: Boolean, default: false }, year: Number, shift: String, order: { type: Number, default: 0 },
        requiredBundle: { type: String, enum: ['free', 'basic', 'core', 'premium'], default: 'free' },
        testCategory: { type: String, enum: ['general', 'coding'], default: 'general' }
    }, { timestamps: true });

    const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);

    // 1. SEED BUNDLES
    console.log('\n📦 Seeding Bundles...');
    const bundles = [
        {
            title: 'Basic Pack', slug: 'nsat-basic', description: 'Start your NSAT preparation', exam: 'NSAT', tier: 'basic', price: 300,
            features: ['3 Mock Tests', '3 PYQ Papers', 'Interview Questions'], mocksIncluded: 3, pyqsIncluded: 3, interviewQuestionsIncluded: true
        },
        {
            title: 'Core Pack', slug: 'nsat-core', description: 'Serious about success?', exam: 'NSAT', tier: 'core', price: 500,
            features: ['5 Mock Tests', '5 PYQ Papers', 'WhatsApp Community', 'Interview Coordination'],
            mocksIncluded: 5, pyqsIncluded: 5, interviewQuestionsIncluded: true, whatsappGroupLink: 'https://chat.whatsapp.com/Dv5cSSZUPeC7egTbJ43fwF'
        },
        {
            title: 'Premium Pack', slug: 'nsat-premium', description: 'Maximum preparation', exam: 'NSAT', tier: 'premium', price: 800,
            features: ['All 20 Mock Tests', 'All PYQ Papers', 'VIP WhatsApp Group', 'Priority Interview'],
            mocksIncluded: 20, pyqsIncluded: 10, interviewQuestionsIncluded: true, whatsappGroupLink: 'https://chat.whatsapp.com/FSGst6uURfRDCjUwPe8kof'
        }
    ];
    for (const b of bundles) {
        await Bundle.findOneAndUpdate({ slug: b.slug }, b, { upsert: true });
        console.log(`  ✓ ${b.title} (₹${b.price})`);
    }

    // 2. UPDATE EXISTING MOCKS
    console.log('\n📝 Updating existing mocks...');
    await MockTest.updateMany({ slug: /general/ }, { testCategory: 'general' });
    await MockTest.updateMany({ slug: /coding/ }, { testCategory: 'coding' });
    await MockTest.updateMany({ slug: /-01$/ }, { requiredBundle: 'free' });
    console.log('  ✓ Updated existing mocks');

    // 3. SEED NEW MOCKS
    console.log('\n🎯 Seeding new mock tests...');
    const tiers = { basic: [2, 3], core: [4, 5], premium: [6, 7, 8, 9, 10] };
    for (const cat of ['general', 'coding']) {
        for (const [tier, nums] of Object.entries(tiers)) {
            for (const n of nums) {
                const slug = `nsat-${cat}-full-mock-${String(n).padStart(2, '0')}`;
                await MockTest.findOneAndUpdate({ slug }, {
                    title: `NSAT ${cat === 'coding' ? 'Coding' : 'General'} Full Mock Test ${String(n).padStart(2, '0')}`,
                    slug, description: `Complete NSAT ${cat} mock test`, examType: cat === 'coding' ? 'coding-nsat' : 'nsat',
                    duration: 180, totalMarks: cat === 'coding' ? 280 : 320, sections: [],
                    instructions: ['180 minutes', '+4/-1 marking', 'Proctored test'],
                    isActive: true, difficulty: 'medium', order: n, requiredBundle: tier, testCategory: cat
                }, { upsert: true });
                console.log(`  ✓ ${cat} Mock ${n} (${tier})`);
            }
        }
    }

    // 4. SEED PYQs
    console.log('\n📚 Seeding PYQ sets...');
    const pyqs = [
        { title: 'Newton Paper 2024 - Set 1', slug: 'newton-pyq-2024-1', tier: 'basic' },
        { title: 'Newton Paper 2024 - Set 2', slug: 'newton-pyq-2024-2', tier: 'basic' },
        { title: 'NSAT Mock Q&A Paper', slug: 'nsat-mock-qa', tier: 'basic' },
        { title: 'NSAT Phase 2 Paper', slug: 'nsat-phase-2', tier: 'core' },
        { title: 'NSAT Practice Set 2024', slug: 'nsat-practice-2024', tier: 'core' },
        { title: 'Interview Questions Master', slug: 'interview-master', tier: 'premium' }
    ];
    for (const p of pyqs) {
        await MockTest.findOneAndUpdate({ slug: p.slug }, {
            title: p.title, slug: p.slug, description: `PYQ: ${p.title}`, examType: 'nsat',
            duration: 180, totalMarks: 320, sections: [], instructions: ['PYQ Practice'],
            isPYQ: true, isActive: true, requiredBundle: p.tier, testCategory: 'general'
        }, { upsert: true });
        console.log(`  ✓ ${p.title} (${p.tier})`);
    }

    console.log('\n✅ Seeding completed!');
    console.log('  - 3 Bundles');
    console.log('  - 18 new mocks (9 General + 9 Coding)');
    console.log('  - 6 PYQ sets');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
