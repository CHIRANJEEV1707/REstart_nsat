// Demote user to normal role
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';
const TARGET_EMAIL = 'sahil.khan@adypu.edu.in';

async function demoteUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: TARGET_EMAIL },
            { $set: { role: 'user' } }
        );

        if (result.matchedCount > 0) {
            console.log(`\n✅ Successfully updated role for ${TARGET_EMAIL} to 'user'!`);
        } else {
            console.log(`\n❌ User with email ${TARGET_EMAIL} not found!`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

demoteUser();
