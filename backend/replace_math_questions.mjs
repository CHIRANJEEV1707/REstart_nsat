import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Target mock slug - change this for different mocks
const TARGET_MOCK_SLUG = 'nsat-general-mock-8';
const SOURCE_FILE = '../docs/mathsquestion.json';

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
    topics: [String]
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

const Question = mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.model('MockTest', MockTestSchema);

async function replaceMathQuestions() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find target mock
    const targetMock = await MockTest.findOne({ slug: TARGET_MOCK_SLUG });
    if (!targetMock) {
        console.log('Mock not found:', TARGET_MOCK_SLUG);
        process.exit(1);
    }
    console.log('Found target mock:', targetMock.title);

    // Load the harder math questions
    const mathDataPath = path.join(__dirname, SOURCE_FILE);
    const mathData = JSON.parse(fs.readFileSync(mathDataPath, 'utf-8'));
    const harderMathQuestions = mathData.questions.filter(q =>
        q.section === 'Math (Class 10)' || q.section === 'Math (11-12)'
    );
    console.log('Harder math questions to inject:', harderMathQuestions.length);

    // Delete old math questions for this mock
    const deleted = await Question.deleteMany({
        mockTestId: targetMock._id,
        section: { $in: ['Math (Class 10)', 'Math (11-12)'] }
    });
    console.log('Deleted old math questions:', deleted.deletedCount);

    // Insert new harder math questions
    const newQuestionIds = [];
    for (const q of harderMathQuestions) {
        const question = await Question.create({
            ...q,
            mockTestId: targetMock._id,
            options: Array.isArray(q.options) && typeof q.options[0] === 'string'
                ? q.options.map((t, i) => ({ id: (i + 1).toString(), text: t }))
                : q.options
        });
        newQuestionIds.push(question._id);
    }

    // Get remaining non-math questions
    const otherQuestions = await Question.find({
        mockTestId: targetMock._id,
        section: { $nin: ['Math (Class 10)', 'Math (11-12)'] }
    });

    // Update mock with all question IDs
    targetMock.questions = [...newQuestionIds, ...otherQuestions.map(q => q._id)];
    await targetMock.save();

    console.log('✅ Replaced math questions in Mock 10 with', newQuestionIds.length, 'harder questions!');
    process.exit(0);
}

replaceMathQuestions().catch(err => { console.error('Error:', err); process.exit(1); });
