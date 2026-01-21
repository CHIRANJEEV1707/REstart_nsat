// Check DB contents
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function check() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));

    const bundles = await mongoose.connection.db.collection('bundles').find({}).toArray();
    console.log('\\nBundles:', bundles.length);
    bundles.forEach(b => console.log(`  - ${b.title} (₹${b.price})`));

    const mocks = await mongoose.connection.db.collection('mocktests').find({}).toArray();
    console.log('\\nMockTests:', mocks.length);

    const byCategory = {};
    const byBundle = {};
    mocks.forEach(m => {
        byCategory[m.testCategory || 'unknown'] = (byCategory[m.testCategory || 'unknown'] || 0) + 1;
        byBundle[m.requiredBundle || 'unknown'] = (byBundle[m.requiredBundle || 'unknown'] || 0) + 1;
    });
    console.log('  By category:', byCategory);
    console.log('  By bundle:', byBundle);

    await mongoose.disconnect();
}

check().catch(console.error);
