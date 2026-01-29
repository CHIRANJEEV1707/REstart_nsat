#!/usr/bin/env node
/**
 * Ingest generated NSAT mocks into MongoDB
 * Clears old mocks and adds new ones with proper tier access
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, 'backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment');
    process.exit(1);
}

// Define schemas
const QuestionSchema = new mongoose.Schema({
    mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
    section: String,
    questionNumber: Number,
    questionText: { type: String, required: true },
    questionImage: String,
    questionType: { type: String, enum: ['mcq', 'coding', 'subjective'], default: 'mcq' },
    options: [{ id: String, text: String, image: String }],
    correctAnswer: String,
    explanation: String,
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topics: [String],
    hash: String // Original question hash for reference
});

const MockTestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    examType: { type: String, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, default: 0 },
    sections: [{ name: String, questionCount: Number, marks: Number }],
    instructions: [{ type: String }],
    isFree: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    difficulty: { type: String, default: 'medium' },
    isPYQ: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    requiredBundle: { type: String, enum: ['free', 'basic', 'core', 'premium'], default: 'free' },
    testCategory: { type: String, enum: ['general', 'coding'], default: 'general' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);

async function clearOldMocks() {
    console.log('🗑️  Clearing old NSAT general mocks...');

    // Find all existing NSAT general mocks
    const oldMocks = await MockTest.find({
        examType: 'nsat',
        testCategory: 'general',
        isPYQ: false
    });

    console.log(`   Found ${oldMocks.length} existing mocks to remove`);

    for (const mock of oldMocks) {
        // Delete associated questions
        await Question.deleteMany({ mockTestId: mock._id });
        // Delete the mock
        await MockTest.deleteOne({ _id: mock._id });
        console.log(`   ✓ Removed: ${mock.title}`);
    }
}

async function ingestMocks() {
    const mocksDir = path.join(projectRoot, 'docs/generated_mocks');
    const files = fs.readdirSync(mocksDir)
        .filter(f => f.startsWith('nsat_general_mock_') && f.endsWith('.json'))
        .sort();

    console.log(`\n📂 Found ${files.length} mock files to ingest`);

    let totalQuestions = 0;

    for (const file of files) {
        const filePath = path.join(mocksDir, file);
        const mockData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log(`\n🔸 Processing: ${mockData.title}`);

        // Create mock test (without questions first)
        const mock = await MockTest.findOneAndUpdate(
            { slug: mockData.slug },
            {
                title: mockData.title,
                slug: mockData.slug,
                description: mockData.description,
                examType: mockData.examType,
                duration: mockData.duration,
                totalMarks: mockData.totalMarks,
                passingMarks: mockData.passingMarks || 0,
                sections: mockData.sections,
                instructions: mockData.instructions,
                isFree: mockData.isFree,
                isPremium: mockData.isPremium,
                isActive: mockData.isActive,
                difficulty: mockData.difficulty,
                isPYQ: mockData.isPYQ || false,
                order: mockData.order,
                requiredBundle: mockData.requiredBundle,
                testCategory: mockData.testCategory || 'general',
                questions: []
            },
            { upsert: true, new: true }
        );

        // Clear any existing questions for this mock
        await Question.deleteMany({ mockTestId: mock._id });

        // Insert questions
        const questionIds = [];
        for (const q of mockData.questions) {
            const question = await Question.create({
                mockTestId: mock._id,
                section: q.section,
                questionNumber: q.questionNumber,
                questionText: q.questionText,
                questionImage: q.questionImage,
                questionType: q.questionType || 'mcq',
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                marks: q.marks || 4,
                negativeMarks: q.negativeMarks || 1,
                difficulty: q.difficulty || 'medium',
                topics: q.topics || [],
                hash: q.hash
            });
            questionIds.push(question._id);
        }

        // Update mock with question references
        mock.questions = questionIds;
        await mock.save();

        totalQuestions += questionIds.length;
        console.log(`   ✓ Added ${questionIds.length} questions (tier: ${mockData.requiredBundle})`);
    }

    return { mockCount: files.length, totalQuestions };
}

async function main() {
    try {
        console.log('🚀 NSAT Mock Ingestion');
        console.log('='.repeat(60));
        console.log(`Connecting to MongoDB...`);

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        await clearOldMocks();
        const { mockCount, totalQuestions } = await ingestMocks();

        console.log('\n' + '='.repeat(60));
        console.log('✅ INGESTION COMPLETE');
        console.log('='.repeat(60));
        console.log(`   Mocks created: ${mockCount}`);
        console.log(`   Total questions: ${totalQuestions}`);
        console.log('\n   Tier distribution:');
        console.log('   - Basic (free for basic+): Mocks 1-3');
        console.log('   - Core (free for core+): Mocks 4-8');
        console.log('   - Premium (premium only): Mocks 9-12');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
