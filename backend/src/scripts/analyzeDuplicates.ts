/**
 * Database Analysis Script
 * Identifies duplicate questions and analyzes mock test data
 * Run with: npx ts-node --transpile-only src/scripts/analyzeDuplicates.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Load env from frontend/.env.local manually if available
const loadFrontendEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '../../../frontend/.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            for (const line of envConfig.split('\n')) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    process.env[match[1]] = match[2].trim();
                }
            }
            console.log('Loaded env from frontend/.env.local');
        }
    } catch (e) {
        console.error('Error loading env:', e);
    }
};

loadFrontendEnv();

// Import models after env is loaded
import MockTest from '../models/MockTest';
import Question from '../models/Question';

const analyze = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB\n');

        // 1. List all mock tests
        console.log('='.repeat(60));
        console.log('MOCK TESTS ANALYSIS');
        console.log('='.repeat(60));

        const mockTests = await MockTest.find({}).sort({ examType: 1, title: 1 });
        console.log(`\nTotal Mock Tests: ${mockTests.length}\n`);

        for (const test of mockTests) {
            const questionCount = await Question.countDocuments({ mockTestId: test._id });
            console.log(`[${test.examType.toUpperCase().padEnd(12)}] ${test.title}`);
            console.log(`   Questions: ${questionCount}, isFree: ${test.isFree}, slug: ${test.slug}`);
        }

        // 2. Check for duplicate sourceIds
        console.log('\n' + '='.repeat(60));
        console.log('DUPLICATE SOURCE IDs');
        console.log('='.repeat(60));

        const duplicateSourceIds = await Question.aggregate([
            { $match: { sourceId: { $exists: true, $ne: null } } },
            { $group: { _id: '$sourceId', count: { $sum: 1 }, mockTestIds: { $addToSet: '$mockTestId' } } },
            { $match: { count: { $gt: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        if (duplicateSourceIds.length === 0) {
            console.log('\n✓ No duplicate sourceIds found');
        } else {
            console.log(`\n⚠ Found ${duplicateSourceIds.length} duplicate sourceIds:\n`);
            for (const dup of duplicateSourceIds) {
                console.log(`  sourceId: ${dup._id} (count: ${dup.count})`);
            }
        }

        // 3. Check for duplicate question text
        console.log('\n' + '='.repeat(60));
        console.log('DUPLICATE QUESTION TEXT');
        console.log('='.repeat(60));

        const duplicateTexts = await Question.aggregate([
            {
                $group: {
                    _id: { $substr: ['$questionText', 0, 100] }, // First 100 chars
                    count: { $sum: 1 },
                    mockTestIds: { $addToSet: '$mockTestId' },
                    questions: { $push: { id: '$_id', section: '$section' } }
                }
            },
            { $match: { count: { $gt: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        if (duplicateTexts.length === 0) {
            console.log('\n✓ No duplicate question texts found');
        } else {
            console.log(`\n⚠ Found ${duplicateTexts.length} potential duplicate question texts:\n`);
            for (const dup of duplicateTexts) {
                const testNames = await MockTest.find({ _id: { $in: dup.mockTestIds } }).select('title examType');
                console.log(`  Text: "${dup._id.substring(0, 50)}..."`);
                console.log(`  Count: ${dup.count}, In tests: ${testNames.map(t => t.title).join(', ')}`);
                console.log('');
            }
        }

        // 4. NSAT-specific analysis
        console.log('\n' + '='.repeat(60));
        console.log('NSAT MOCK TEST ANALYSIS');
        console.log('='.repeat(60));

        const nsatTests = await MockTest.find({ examType: 'nsat' });
        for (const test of nsatTests) {
            const questions = await Question.find({ mockTestId: test._id });
            const sections = [...new Set(questions.map(q => q.section))];
            const subjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];

            console.log(`\n${test.title}:`);
            console.log(`  Questions: ${questions.length}`);
            console.log(`  Sections: ${sections.join(', ')}`);
            if (subjects.length > 0) {
                console.log(`  Subjects: ${subjects.join(', ')}`);
            }

            // Check for JEE-like questions (Physics, Chemistry, Mathematics)
            const jeeSubjects = questions.filter(q =>
                ['Physics', 'Chemistry', 'Mathematics'].includes(q.subject || '')
            );
            if (jeeSubjects.length > 0) {
                console.log(`  ⚠ Contains ${jeeSubjects.length} JEE-like subjects (Physics/Chemistry/Mathematics)`);
            }
        }

        // 5. Questions per exam type
        console.log('\n' + '='.repeat(60));
        console.log('QUESTIONS PER EXAM TYPE');
        console.log('='.repeat(60));

        const examTypes = await MockTest.distinct('examType');
        for (const examType of examTypes) {
            const tests = await MockTest.find({ examType });
            const testIds = tests.map(t => t._id);
            const count = await Question.countDocuments({ mockTestId: { $in: testIds } });
            console.log(`  ${examType.padEnd(15)}: ${count} questions across ${tests.length} tests`);
        }

        console.log('\nAnalysis complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during analysis:', error);
        process.exit(1);
    }
};

analyze();
