// Check orders in database
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://arpitsarang2020_db_user:arpitsarang2020@restart.fq24fhd.mongodb.net/?appName=RESTART';

async function check() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const orders = await mongoose.connection.db.collection('orders').find({}).toArray();
    console.log('\nTotal Orders:', orders.length);

    if (orders.length === 0) {
        console.log('  No orders found in database!');
        console.log('  Pending approvals will only appear when users submit UPI payment proofs.');
    } else {
        console.log('\nOrders by status:');
        const byStatus = {};
        orders.forEach(o => {
            const key = `${o.status || 'unknown'} / verif: ${o.verificationStatus || 'none'}`;
            byStatus[key] = (byStatus[key] || 0) + 1;
        });
        Object.entries(byStatus).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

        const pending = orders.filter(o => o.verificationStatus === 'pending');
        console.log('\n Pending verification orders:', pending.length);
        pending.forEach(o => {
            console.log(`  - ${o._id}: ${o.productSlug} (₹${o.amount}) [${o.paymentMethod}]`);
        });
    }

    await mongoose.disconnect();
}

check().catch(console.error);
