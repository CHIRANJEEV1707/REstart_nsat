/**
 * seedNsatV2.ts
 *
 * Migrates NSAT mock tests and bundles to the new 2-tier system:
 *   - free:    NSAT General 01-04 + Coding 01-04 (40% open)
 *   - premium: NSAT General 05-10 + Coding 05-10 (60% locked, ₹800)
 *
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/seedNsatV2.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Load env from frontend/.env.local
const envPath = path.resolve(__dirname, '../../../frontend/.env.local');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    }
}

import MockTest from '../models/MockTest';
import Bundle from '../models/Bundle';

async function run() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // ── 1. Deactivate all existing NSAT bundles ──────────────────────────
    const deactivated = await Bundle.updateMany(
        { exam: 'nsat', slug: { $ne: 'nsat-free' } },
        { isActive: false }
    );
    console.log(`Deactivated ${deactivated.modifiedCount} old NSAT bundle(s).`);

    // ── 2. Upsert nsat-free bundle ────────────────────────────────────────
    await Bundle.findOneAndUpdate(
        { slug: 'nsat-free' },
        {
            title: 'NSAT Free Pack',
            slug: 'nsat-free',
            description: 'Access 4 General + 4 Coding NSAT mock tests for free.',
            exam: 'nsat',
            tags: ['nsat', 'free'],
            features: [
                '4 Full-length NSAT General Mock Tests',
                '4 Full-length NSAT Coding Mock Tests',
                'Detailed solutions & analytics',
            ],
            price: 0,
            currency: 'INR',
            validityDays: 365,
            isActive: true,
            tier: 'free',
            variant: 'combined',
            mocksIncluded: 8,
            pyqsIncluded: 0,
            interviewQuestionsIncluded: false,
        },
        { upsert: true, new: true }
    );
    console.log('Upserted nsat-free bundle.');

    // ── 3. Upsert nsat-premium bundle ─────────────────────────────────────
    await Bundle.findOneAndUpdate(
        { slug: 'nsat-premium' },
        {
            title: 'NSAT Premium Pack',
            slug: 'nsat-premium',
            description: 'Unlock all 10 General + 10 Coding NSAT mock tests.',
            exam: 'nsat',
            tags: ['nsat', 'premium'],
            features: [
                'All 10 NSAT General Mock Tests',
                'All 10 NSAT Coding Mock Tests',
                'Full PYQ library',
                'VIP WhatsApp community',
                'Interview prep priority support',
                'Lifetime access',
            ],
            price: 800,
            currency: 'INR',
            validityDays: 36500,
            isActive: true,
            tier: 'premium',
            variant: 'combined',
            mocksIncluded: 20,
            pyqsIncluded: 10,
            interviewQuestionsIncluded: true,
            whatsappGroupLink: 'https://chat.whatsapp.com/FSGst6uURfRDCjUwPe8kof',
        },
        { upsert: true, new: true }
    );
    console.log('Upserted nsat-premium bundle.');

    // ── 4. Update mock test requiredBundle based on order/title number ────
    const allNsatTests = await MockTest.find({
        examType: { $in: ['nsat', 'coding-nsat'] },
        isActive: true,
    });

    console.log(`Found ${allNsatTests.length} active NSAT mock test(s).`);

    let freeCount = 0;
    let premiumCount = 0;

    for (const test of allNsatTests) {
        const title = test.title.toLowerCase();
        const match = title.match(/(?:mock|test)\s*(?:test\s*)?(\d+)/i) || title.match(/(\d+)$/);
        const num = match ? parseInt(match[1], 10) : (test.order || 99);

        const isFreeTest = num >= 1 && num <= 4;

        await MockTest.updateOne(
            { _id: test._id },
            {
                isFree: isFreeTest,
                isPremium: !isFreeTest,
                requiredBundle: isFreeTest ? 'free' : 'premium',
            }
        );

        if (isFreeTest) freeCount++;
        else premiumCount++;

        console.log(`  ${test.title} (order=${test.order}, num=${num}) → ${isFreeTest ? 'FREE' : 'PREMIUM'}`);
    }

    console.log(`\nDone. Free: ${freeCount}, Premium: ${premiumCount}`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
