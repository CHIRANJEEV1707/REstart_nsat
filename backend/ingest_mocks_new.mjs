import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current directory
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/restart?retryWrites=true&w=majority";

const QuestionSchema = new mongoose.Schema({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    section: String,
    questionNumber: Number,
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'coding', 'subjective'], default: 'mcq' },
    options: [{ id: String, text: String }],
    correctAnswer: String,
    explanation: String,
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topics: [String],
    isCoding: { type: Boolean, default: false },
    constraints: String,
    testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }]
});

const MockTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    examType: { type: String, required: true },
    duration: { type: Number, default: 180 },
    totalMarks: { type: Number, default: 300 },
    sections: [{ name: String, questionCount: Number, marks: Number }],
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    isActive: { type: Boolean, default: true }
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);

async function ingestMocks() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Project root is one level up from backend/
        const projectRoot = path.resolve(__dirname, '..');

        const files = [
            path.join(projectRoot, 'docs/mocktestsgeneral/mock4.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/mock5.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/mock6.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/mock7.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/mock8.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/mock9&10.json'), // Contains Mock 10
        ];

        let totalMocks = 0;
        let totalQuestions = 0;

        for (const filePath of files) {
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${filePath}, skipping...`);
                continue;
            }

            console.log(`\n📂 Processing: ${filePath}`);
            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            let mocksToProcess = [];

            if (rawData.NSAT_General_Mocks) {
                // ... (Logic for NSAT_General_Mocks array if needed, but not expected for these files)
                console.log("Found NSAT_General_Mocks array (unexpected but handling)");
                mocksToProcess = rawData.NSAT_General_Mocks;
            } else if (rawData.title) {
                mocksToProcess.push(rawData);
            }

            for (const mockData of mocksToProcess) {
                console.log(`   🔸 Ingesting "${mockData.title}"...`);

                const mockTest = await MockTest.findOneAndUpdate(
                    { slug: mockData.slug },
                    {
                        title: mockData.title,
                        examType: 'nsat', // Force 'nsat' to match existing mocks and frontend expectation
                        duration: mockData.duration,
                        totalMarks: mockData.totalMarks,
                        sections: mockData.sections,
                        isActive: true
                    },
                    { upsert: true, new: true }
                );

                const questionIds = [];
                for (const q of mockData.questions) {
                    const question = await Question.findOneAndUpdate(
                        { mockTestId: mockTest._id, questionNumber: q.questionNumber, section: q.section },
                        {
                            ...q,
                            mockTestId: mockTest._id,
                            options: Array.isArray(q.options) && typeof q.options[0] === 'string'
                                ? q.options.map((t, i) => ({ id: (i + 1).toString(), text: t }))
                                : q.options
                        },
                        { upsert: true, new: true }
                    );
                    questionIds.push(question._id);
                }

                mockTest.questions = questionIds;
                await mockTest.save();

                console.log(`      ✅ Saved ${questionIds.length} questions.`);
                totalMocks++;
                totalQuestions += questionIds.length;
            }
        }

        console.log(`\n🎉 Ingestion Complete!`);
        console.log(`Total Mocks Ingested/Updated: ${totalMocks}`);
        console.log(`Total Questions Processed: ${totalQuestions}`);

        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

ingestMocks();
