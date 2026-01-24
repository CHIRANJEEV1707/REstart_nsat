// Script to fix Shresht Jain's bundle assignment
// Run: node --experimental-strip-types frontend/scripts/fix-shresht-bundle.ts

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function fixBundle() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const userId = '69710d7e889e46a067735c5d';

        // Find the correct premium bundle
        const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', new mongoose.Schema({
            title: String, slug: String, tier: String, variant: String, price: Number
        }));

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            name: String, email: String, purchasedBundles: Array
        }));

        // Find premium bundle
        const premiumBundle = await Bundle.findOne({ slug: 'nsat-premium' });
        if (!premiumBundle) {
            console.error('nsat-premium bundle not found!');
            process.exit(1);
        }
        console.log(`Found bundle: ${premiumBundle.title} (ID: ${premiumBundle._id})`);

        // Update user's bundle
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User not found: ${userId}`);
            process.exit(1);
        }

        console.log(`User: ${user.name} (${user.email})`);
        console.log('Current purchasedBundles:', JSON.stringify(user.purchasedBundles, null, 2));

        // Update the bundle entry to use correct bundleId
        if (user.purchasedBundles && user.purchasedBundles.length > 0) {
            // Update the first bundle entry to have correct bundleId
            const result = await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        'purchasedBundles.0.bundleId': premiumBundle._id,
                        'purchasedBundles.0.verificationStatus': 'active'
                    }
                }
            );
            console.log('Update result:', result);
        } else {
            // Add new bundle entry
            const result = await User.updateOne(
                { _id: userId },
                {
                    $push: {
                        purchasedBundles: {
                            bundleId: premiumBundle._id,
                            purchasedAt: new Date(),
                            orderId: `OFFICIAL_MANUAL_${Date.now()}`,
                            paymentId: `OFFICIAL_MANUAL_${Date.now()}`,
                            verificationStatus: 'active'
                        }
                    }
                }
            );
            console.log('Update result:', result);
        }

        // Verify the update
        const updatedUser = await User.findById(userId);
        console.log('\nUpdated purchasedBundles:', JSON.stringify(updatedUser?.purchasedBundles, null, 2));
        console.log('\n✅ Done!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixBundle();
