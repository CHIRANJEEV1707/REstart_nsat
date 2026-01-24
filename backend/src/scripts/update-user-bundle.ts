import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Bundle from '../models/Bundle';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

async function updateBundle() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const userId = '69710d7e889e46a067735c5d';
        const bundleSlug = 'nsat-premium-general'; // 800 RS General Only

        console.log(`Searching for bundle: ${bundleSlug}...`);
        const bundle = await Bundle.findOne({ slug: bundleSlug });

        if (!bundle) {
            console.error(`Bundle not found: ${bundleSlug}`);
            process.exit(1);
        }

        console.log(`Found bundle: ${bundle.title} (ID: ${bundle._id})`);

        console.log(`Updating user: ${userId}...`);

        // Use findOneAndUpdate to add to array if not already present
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'purchasedBundles.bundleId': { $ne: bundle._id }
            },
            {
                $push: {
                    purchasedBundles: {
                        bundleId: bundle._id,
                        purchasedAt: new Date(),
                        orderId: `OFFICIAL_MANUAL_${Date.now()}`,
                        paymentId: `OFFICIAL_MANUAL_${Date.now()}`
                    }
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            // Check if user exists or if bundle already exists
            const existingUser = await User.findById(userId);
            if (!existingUser) {
                console.error(`User not found: ${userId}`);
            } else {
                console.log('User already has this bundle or update failed.');
                console.log('Current purchasedBundles:', existingUser.purchasedBundles);
            }
        } else {
            console.log('User updated successfully!');
            console.log('Updated purchasedBundles:', updatedUser.purchasedBundles);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating user bundle:', error);
        process.exit(1);
    }
}

updateBundle();
