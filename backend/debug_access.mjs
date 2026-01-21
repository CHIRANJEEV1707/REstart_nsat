
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

// Mock Schema (simplified)
const MockTestSchema = new mongoose.Schema({
    title: String,
    slug: String,
    examType: String,
    isActive: Boolean,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});
const MockTest = mongoose.model('MockTest', MockTestSchema);

// Question Schema (simplified)
const QuestionSchema = new mongoose.Schema({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' }
});
const Question = mongoose.model('Question', QuestionSchema);

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    email: String,
    purchasedBundles: [{
        bundleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },
        verificationStatus: String
    }]
});
const User = mongoose.model('User', UserSchema);

// Bundle Schema
const BundleSchema = new mongoose.Schema({
    slug: String,
    variant: String,
    tier: String
});
const Bundle = mongoose.model('Bundle', BundleSchema);

async function debugAccess() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // 1. Check Mocks & Question Counts
        console.log('\n--- MOCK TEST COUNTS (Aggregation) ---');
        const counts = await Question.aggregate([
            { $group: { _id: "$mockTestId", count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map(c => [c._id?.toString(), c.count]));

        const mocks = await MockTest.find({}).sort({ createdAt: -1 });
        mocks.forEach(m => {
            const c = countMap.get(m._id.toString()) || 0;
            console.log(`[${m.examType}] ${m.title}: ${c} questions (ID: ${m._id}, Active: ${m.isActive})`);
        });

        // 2. Check User Bundles
        console.log('\n--- USER BUNDLES (sahil.khan@adypu.edu.in) ---');
        const user = await User.findOne({ email: 'sahil.khan@adypu.edu.in' }).populate('purchasedBundles.bundleId');

        if (!user) {
            console.log('User not found.');
        } else {
            console.log(`User: ${user.email}`);
            console.log('Bundles:', JSON.stringify(user.purchasedBundles, null, 2));
        }

        // 3. Simulate Frontend Logic Dry Run
        console.log('\n--- FRONTEND LOGIC DRY RUN ---');

        // Mock frontend helpers
        const isFullMock = (test, qCount) => {
            if (!qCount || qCount <= 0) return false;
            const t = test.title.toLowerCase();
            if (!t.includes('mock')) return false;
            if (t.includes('practice set')) return false;
            if (t.includes('interview')) return false;
            if (t.includes('pyq')) return false;
            if (t.includes('phase 2')) return false;
            return true;
        };

        const getUserRelevance = (test, user) => {
            if (!user || !user.purchasedBundles || user.purchasedBundles.length === 0) return true;

            const activeBundles = user.purchasedBundles.filter(b =>
                b.verificationStatus === 'active' || b.verificationStatus === 'approved'
            );

            if (activeBundles.length === 0) return true;

            const hasCodingOnly = activeBundles.some(b => b.bundleId?.variant === 'coding');
            const hasGeneralOnly = activeBundles.some(b => b.bundleId?.variant === 'general');
            const hasCombined = activeBundles.some(b => !b.bundleId?.variant || b.bundleId?.variant === 'combined');

            if (hasCombined) return true;

            const isCodingTest = test.testCategory === 'coding' || test.examType === 'coding-nsat';
            const isGeneralTest = test.testCategory === 'general' || test.examType === 'nsat';

            if (hasCodingOnly && isCodingTest) return true;
            if (hasGeneralOnly && isGeneralTest) return true;

            return false;
        };

        const canAccessTest = (test, user) => {
            if (test.isFree) return true;

            // Simplified tier check (assuming tier meets requirement for debugging)
            if (!user?.purchasedBundles?.length) return false;

            return user.purchasedBundles.some(bundle => {
                if (bundle.verificationStatus !== 'active' && bundle.verificationStatus !== 'approved') return false;

                const variant = bundle.bundleId?.variant || 'combined';

                const testCategory = test.testCategory || (test.examType === 'coding-nsat' ? 'coding' : 'general');

                if (variant === 'combined') return true;
                if (variant === 'general' && testCategory === 'general') return true;
                if (variant === 'coding' && testCategory === 'coding') return true;

                return false;
            });
        };

        mocks.forEach(m => {
            const c = countMap.get(m._id.toString()) || 0;
            const fullMock = isFullMock(m, c);
            const relevance = getUserRelevance(m, user);
            const access = canAccessTest(m, user);

            console.log(`Test: ${m.title}`);
            console.log(`  > Questions: ${c}`);
            console.log(`  > isFullMock: ${fullMock}`);
            console.log(`  > getUserRelevance: ${relevance}`);
            console.log(`  > canAccessTest: ${access}`);
            console.log(`  > VISIBLE? ${fullMock && relevance ? 'YES' : 'NO'}`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugAccess();
