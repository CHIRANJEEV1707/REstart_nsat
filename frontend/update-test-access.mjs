import mongoose from 'mongoose';
import fs from 'fs';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';
const LOG_FILE = 'migration-log.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function updateAccess() {
    // Clear log file
    fs.writeFileSync(LOG_FILE, 'Starting migration...\n');

    try {
        await mongoose.connect(MONGODB_URI);
        log('Connected to MongoDB');

        // List collections to verify
        const cols = await mongoose.connection.db.listCollections().toArray();
        log(`Collections found: ${cols.map(c => c.name).join(', ')}`);

        const db = mongoose.connection.db;
        const mocks = await db.collection('mocktests').find({}).toArray();

        log(`Found ${mocks.length} mock tests. Updating access tiers...`);

        for (const test of mocks) {
            let requiredBundle = 'premium'; // Default to strictest

            const title = test.title || '';
            const lowerTitle = title.toLowerCase();

            // 1. Free Tests (Test 01)
            if (lowerTitle.includes('test 01') || lowerTitle.includes('test 1 ')) {
                requiredBundle = 'free';
            }
            // 2. Basic Tier (Tests 02, 03 AND Interview/Practice sets)
            else if (
                lowerTitle.includes('test 02') || lowerTitle.includes('test 2 ') ||
                lowerTitle.includes('test 03') || lowerTitle.includes('test 3 ') ||
                lowerTitle.includes('interview') ||
                lowerTitle.includes('practice set') ||
                lowerTitle.includes('phase 2') ||
                lowerTitle.includes('newton paper')
            ) {
                requiredBundle = 'basic';
            }
            // 3. Core Tier (Tests 04, 05)
            else if (
                lowerTitle.includes('test 04') || lowerTitle.includes('test 4 ') ||
                lowerTitle.includes('test 05') || lowerTitle.includes('test 5 ')
            ) {
                requiredBundle = 'core';
            }
            // 4. Premium Tier (Tests 06+)
            else {
                requiredBundle = 'premium';
            }

            // Special case for "NSAT Full Mock Test 01" which might not match "test 1 " strict
            if (lowerTitle.endsWith(' 01') || lowerTitle.endsWith(' 1')) requiredBundle = 'free';

            log(`Updating "${title}" -> ${requiredBundle}`);

            await db.collection('mocktests').updateOne(
                { _id: test._id },
                {
                    $set: {
                        requiredBundle,
                        isFree: requiredBundle === 'free'
                    }
                }
            );
        }

        log('✅ Access tiers updated successfully!');

    } catch (error) {
        log('Error: ' + error.toString());
    } finally {
        await mongoose.disconnect();
    }
}

updateAccess();
