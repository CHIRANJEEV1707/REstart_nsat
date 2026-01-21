
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') }); // Explicitly load .env from backend dir if running there

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/restart?retryWrites=true&w=majority";

const QuestionSchema = new mongoose.Schema({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    section: String,
    questionNumber: Number,
});

const MockTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    examType: String,
    isActive: Boolean
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);

async function checkMocks() {
    try {
        console.log('Connecting to MongoDB...', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const mocks = await MockTest.find({});
        console.log(`Found ${mocks.length} mock tests.`);

        for (const mock of mocks) {
            const count = await Question.countDocuments({ mockTestId: mock._id });
            const sectionTotal = mock.sections?.reduce((acc, s) => acc + (s.questionCount || 0), 0) || 0;
            console.log(`Mock: "${mock.title}" (slug: ${mock.slug}) - DB Questions: ${count}, Metadata Questions: ${sectionTotal}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkMocks();
