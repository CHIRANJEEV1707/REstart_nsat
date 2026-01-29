import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const QuestionSchema = new mongoose.Schema({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    section: String,
    questionNumber: Number,
    questionText: { type: String, required: true },
    questionType: { type: String, default: 'mcq' },
    options: [{ id: String, text: String }],
    correctAnswer: String,
    explanation: String,
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    difficulty: { type: String, default: 'hard' },
    topics: [String]
});

const MockTestSchema = new mongoose.Schema({
    title: String, slug: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

const Question = mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.model('MockTest', MockTestSchema);

// Mocks to update (3-10, skipping 1 & 2 which already have unique harder questions)
const MOCKS_TO_UPDATE = [
    'nsat-general-mock-3',
    'nsat-general-mock-4',
    'nsat-general-mock-5',
    'nsat-general-mock-6',
    'nsat-general-mock-7',
    'nsat-general-mock-8',
    'nsat-general-mock-10'
];

async function injectHarderMathQuestions() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read and parse JSONL file
    const jsonlPath = path.join(__dirname, '..', 'main2025-apr.jsonl');
    const lines = fs.readFileSync(jsonlPath, 'utf-8').trim().split('\n');

    console.log(`Total questions in JSONL: ${lines.length}`);

    // Parse all questions
    const allQuestions = lines.map((line, idx) => {
        const q = JSON.parse(line);
        return {
            questionText: q.question,
            options: q.options.map((opt, i) => ({ id: (i + 1).toString(), text: opt })),
            correctAnswer: (q.correct_options[0] + 1).toString(), // Convert 0-indexed to 1-indexed
            difficulty: 'hard',
            marks: 4,
            negativeMarks: 1,
            questionType: 'mcq'
        };
    });

    console.log(`Parsed ${allQuestions.length} questions`);

    let questionIndex = 0;

    for (const mockSlug of MOCKS_TO_UPDATE) {
        const mock = await MockTest.findOne({ slug: mockSlug });
        if (!mock) {
            console.log(`Mock not found: ${mockSlug}, skipping...`);
            continue;
        }

        console.log(`\nProcessing: ${mock.title}`);

        // Get 30 unique questions for this mock (15 Class 10 + 15 Class 11-12)
        const questionsForMock = allQuestions.slice(questionIndex, questionIndex + 30);
        if (questionsForMock.length < 30) {
            console.log(`Not enough questions left for ${mockSlug}!`);
            break;
        }
        questionIndex += 30;

        // Delete old math questions
        const deleted = await Question.deleteMany({
            mockTestId: mock._id,
            section: { $in: ['Math (Class 10)', 'Math (11-12)'] }
        });
        console.log(`  Deleted ${deleted.deletedCount} old math questions`);

        // Insert new questions
        const newQuestionIds = [];

        // First 15 as Class 10
        for (let i = 0; i < 15; i++) {
            const q = questionsForMock[i];
            const newQ = await Question.create({
                ...q,
                mockTestId: mock._id,
                section: 'Math (Class 10)',
                questionNumber: i + 1
            });
            newQuestionIds.push(newQ._id);
        }

        // Next 15 as Class 11-12
        for (let i = 15; i < 30; i++) {
            const q = questionsForMock[i];
            const newQ = await Question.create({
                ...q,
                mockTestId: mock._id,
                section: 'Math (11-12)',
                questionNumber: i + 1
            });
            newQuestionIds.push(newQ._id);
        }

        // Get other (non-math) questions
        const otherQuestions = await Question.find({
            mockTestId: mock._id,
            section: { $nin: ['Math (Class 10)', 'Math (11-12)'] }
        });

        // Update mock with all question IDs
        mock.questions = [...newQuestionIds, ...otherQuestions.map(q => q._id)];
        await mock.save();

        console.log(`  ✅ Injected 30 unique harder questions`);
    }

    console.log(`\n🎉 Done! Used ${questionIndex} questions total.`);
    console.log(`Remaining unused questions: ${allQuestions.length - questionIndex}`);

    process.exit(0);
}

injectHarderMathQuestions().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
