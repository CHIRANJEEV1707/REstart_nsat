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
            path.join(projectRoot, 'docs/deepseek_json_20260121_ebd1f8.json'),
            path.join(projectRoot, 'docs/mocktestsgeneral/deepseek_json_20260121_0d1def (1).json'),
            path.join(projectRoot, 'docs/generated_mocks/nsat_general_mock_3.json'),
            path.join(projectRoot, 'docs/generated_mocks/nsat_general_mock_4.json')
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
                const m1 = rawData.NSAT_General_Mocks.find(m => m.mock_number === 1);
                if (m1) {
                    const transformed = {
                        title: "NSAT General Mock 1",
                        slug: "nsat-general-mock-1",
                        examType: "nsat_general",
                        totalMarks: 300,
                        duration: 180,
                        sections: m1.sections.map(s => ({
                            name: s.section_name,
                            questionCount: s.questions.length,
                            marks: s.questions.length * 4
                        })),
                        questions: m1.sections.flatMap(s => s.questions.map(q => ({
                            section: s.section_name,
                            questionNumber: q.id,
                            questionText: q.passage ? `**Passage:** ${q.passage}\n\n${q.question}` : q.question,
                            questionType: 'mcq',
                            options: (q.options || []).map((opt, i) => ({ id: (i + 1).toString(), text: opt })),
                            correctAnswer: (q.options || []).findIndex(opt => opt === q.correct_answer) !== -1 ? ((q.options || []).findIndex(opt => opt === q.correct_answer) + 1).toString() : "1",
                            topics: [q.topic],
                            marks: 4,
                            negativeMarks: 1
                        })))
                    };
                    mocksToProcess.push(transformed);
                }
            } else if (rawData.title) {
                mocksToProcess.push(rawData);
            }

            for (const mockData of mocksToProcess) {
                console.log(`   🔸 Ingesting "${mockData.title}"...`);

                const mockTest = await MockTest.findOneAndUpdate(
                    { slug: mockData.slug },
                    {
                        title: mockData.title,
                        examType: mockData.examType || 'nsat_general',
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
        console.log(`Total Mocks: ${totalMocks}`);
        console.log(`Total Questions: ${totalQuestions}`);

        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

ingestMocks();
