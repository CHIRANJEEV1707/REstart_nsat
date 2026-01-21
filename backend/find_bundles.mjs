
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/restart?retryWrites=true&w=majority";

const BundleSchema = new mongoose.Schema({
    title: String,
    slug: String,
    variant: String,
    isActive: Boolean
});

const Bundle = mongoose.models.Bundle || mongoose.model('Bundle', BundleSchema);

async function findBundles() {
    try {
        await mongoose.connect(MONGODB_URI);
        const bundles = await Bundle.find({});
        console.log('Found bundles:');
        bundles.forEach(b => {
            console.log(`- ${b.title} (Slug: ${b.slug}, Variant: ${b.variant}, ID: ${b._id})`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findBundles();
