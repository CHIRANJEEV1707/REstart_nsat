const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, 'frontend/.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    // try .env
    dotenv.config({ path: path.resolve(__dirname, 'frontend/.env') });
}

console.log('Connecting to DB:', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');

const CollegeSchema = new mongoose.Schema({
    name: String,
    slug: String,
    location: Object
}, { strict: false });

const College = mongoose.model('College', CollegeSchema);
const NewGenCollege = mongoose.model('NewGenCollege', CollegeSchema, 'newgencolleges');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('--- Checking Colleges with "University" or "Engineering" in name ---');
        const colleges = await College.find({
            name: { $in: ["University of Oxford", "University of Cambridge", "Punjab Engineering College (PEC), Chandigarh", "BIT Mesra"] }
        }).select('_id name slug').lean();

        console.log('Found Colleges:', colleges);

        console.log('--- Checking for duplicate slugs ---');
        // Aggregation to find duplicates
        const duplicates = await College.aggregate([
            { $group: { _id: "$slug", count: { $sum: 1 }, names: { $push: "$name" } } },
            { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
        ]);

        if (duplicates.length > 0) {
            console.log('Found DUPLICATE SLUGS:', JSON.stringify(duplicates, null, 2));
        } else {
            console.log('No duplicate slugs found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
