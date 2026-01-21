// Set specific user as admin
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';
const TARGET_EMAIL = 'sahil.khan@adypu.edu.in';

async function setSpecificAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: TARGET_EMAIL },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount > 0) {
            console.log(`\n✅ Successfully updated role for ${TARGET_EMAIL} to 'admin'!`);
            if (result.modifiedCount > 0) {
                console.log('   (Document was modified)');
            } else {
                console.log('   (Document was already admin)');
            }
        } else {
            console.log(`\n❌ User with email ${TARGET_EMAIL} not found!`);
            // List available users to help debug
            const users = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1 } }).toArray();
            console.log('\nAvailable users:');
            users.forEach(u => console.log(`  - ${u.email}`));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

setSpecificAdmin();
