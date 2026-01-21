
import 'dotenv/config';
import mongoose from 'mongoose';
import Question from './src/models/Question';
import MockTest from './src/models/MockTest';
import { validateEnv } from './src/utils/validateEnv';

// Validate Env like server.ts
validateEnv();

const run = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected.');

        console.log('Running Aggregation...');
        const counts = await Question.aggregate([
            { $group: { _id: "$mockTestId", count: { $sum: 1 } } }
        ]);
        console.log('Aggregation Result (First 5):', JSON.stringify(counts.slice(0, 5), null, 2));

        const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));
        console.log('Count Map Size:', countMap.size);

        const tests = await MockTest.find({ examType: 'nsat' }).limit(5);

        tests.forEach(t => {
            const c = countMap.get(t._id.toString()) || 0;
            console.log(`Test: ${t.title} (${t._id}) -> Count: ${c}`);
        });

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
