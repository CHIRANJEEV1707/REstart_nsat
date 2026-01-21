
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

const MockTestSchema = new mongoose.Schema({}, { strict: false });
const MockTest = mongoose.model('MockTest', MockTestSchema);

async function fixExamTypes() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);

        console.log('Updating nsat_general -> nsat...');
        const res = await MockTest.updateMany(
            { examType: 'nsat_general' },
            { $set: { examType: 'nsat' } }
        );

        console.log(`Updated ${res.modifiedCount} mocks.`);

        // Also verify the PYQs
        const pyqs = await MockTest.find({ title: /Newton Paper|Phase 2|Practice Set/i });
        console.log('\n--- PYQ Status ---');
        pyqs.forEach(p => console.log(`${p.title}: ${p.examType}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixExamTypes();
