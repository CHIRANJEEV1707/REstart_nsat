// Set user as admin
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function setAdmin() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users and show their roles
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nCurrent users:');
    users.forEach(u => {
        console.log(`  - ${u.email}: role=${u.role || 'not set'}`);
    });

    // Update your user to admin (update email if needed)
    const email = users.length > 0 ? users[0].email : null;
    if (email) {
        await mongoose.connection.db.collection('users').updateOne(
            { email },
            { $set: { role: 'admin' } }
        );
        console.log(`\n✅ Set ${email} as admin!`);
        console.log('Please log out and log back in to get a new token.');
    } else {
        console.log('No users found in database');
    }

    await mongoose.disconnect();
}

setAdmin().catch(console.error);
