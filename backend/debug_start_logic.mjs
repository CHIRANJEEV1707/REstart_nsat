
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

// Schemas (simplified for check)
const UserSchema = new mongoose.Schema({
    email: String,
    purchasedBundles: [{
        bundleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },
        verificationStatus: String
    }]
});
const User = mongoose.model('User', UserSchema);

const MockTestSchema = new mongoose.Schema({
    title: String,
    slug: String,
    isFree: Boolean,
});
const MockTest = mongoose.model('MockTest', MockTestSchema);

const FreePackClaimSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const FreePackClaim = mongoose.model('FreePackClaim', FreePackClaimSchema);


// Logic from mockTestRoutes.ts
const hasPremiumAccess = async (userId) => {
    // Check if user has any purchased bundle that grants premium access
    // Note: In real app, it is: const User = require('../models/User').default;
    const user = await User.findById(userId);
    console.log(`[DEBUG] hasPremiumAccess - User: ${userId}`);
    console.log(`[DEBUG] hasPremiumAccess - Bundles: ${user?.purchasedBundles?.length}`);
    return user?.purchasedBundles?.length > 0;
};

const hasFreePackAccess = async (userId) => {
    const claim = await FreePackClaim.findOne({ userId });
    console.log(`[DEBUG] hasFreePackAccess - Claim: ${!!claim}`);
    return !!claim;
};

async function debugStart() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const email = 'sahil.khan@adypu.edu.in';
        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }

        console.log(`User ID: ${user._id}`);

        // Find a test that was failing (e.g., one of the visible ones)
        // Looking at dry run, Mock 1, 2, 3 were visible. Let's pick one.
        const test = await MockTest.findOne({ title: /NSAT General Mock 2/i });

        if (!test) {
            console.error('Test not found!');
            process.exit(1);
        }

        console.log(`Test: ${test.title}, isFree: ${test.isFree}`);

        // Simulate Check
        const isPremium = await hasPremiumAccess(user._id);
        const hasFree = await hasFreePackAccess(user._id);

        console.log(`isPremium: ${isPremium}`);
        console.log(`hasFree: ${hasFree}`);

        if (!test.isFree && !isPremium) {
            console.log('Entering Access Check Block...');
            // Check if it's a free pack test and user has claimed
            if (!hasFree || !test.isFree) {
                console.log('>>> 403 FORBIDDEN WOULD BE RETURNED <<<');
                console.log(`Reason: !hasFree (${!hasFree}) OR !test.isFree (${!test.isFree}) is TRUE`);
            } else {
                console.log('>>> ACCESS GRANTED (via Free Pack logic?) <<<');
            }
        } else {
            console.log('>>> ACCESS GRANTED (Premium or Free Test) <<<');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugStart();
