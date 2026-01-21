import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users.`);

        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
