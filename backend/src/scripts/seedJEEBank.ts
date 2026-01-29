/**
 * Seed JEE Question Bank from extracted JSON files
 * 
 * Usage: cd backend && npx ts-node src/scripts/seedJEEBank.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import JEEQuestionBank from '../models/JEEQuestionBank';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart_db';

const SUBJECT_FILES = [
    { subject: 'Mathematics', file: 'jee_mathematics_questions.json' },
    { subject: 'Physics', file: 'jee_physics_questions.json' },
    { subject: 'Chemistry', file: 'jee_chemistry_questions.json' }
];

const EXTRACTED_DIR = path.join(__dirname, '../../../docs/extracted');

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
}

async function seedJEEBank() {
    await connectDB();

    console.log('\n🚀 Starting JEE Question Bank Seeding...\n');

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const { subject, file } of SUBJECT_FILES) {
        const filePath = path.join(EXTRACTED_DIR, file);

        if (!fs.existsSync(filePath)) {
            console.error(`   ❌ File not found: ${filePath}`);
            continue;
        }

        console.log(`📖 Processing ${subject}...`);

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(rawData);

        console.log(`   Found ${questions.length} questions`);

        let inserted = 0;
        let skipped = 0;

        for (const q of questions) {
            try {
                // Use upsert to avoid duplicates
                await JEEQuestionBank.findOneAndUpdate(
                    {
                        subject: q.subject,
                        questionNumber: q.questionNumber
                    },
                    {
                        subject: q.subject,
                        chapter: q.chapter,
                        questionNumber: q.questionNumber,
                        year: q.year,
                        shift: q.shift,
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer || '',
                        isInteger: q.isInteger,
                        difficulty: q.difficulty,
                        tags: q.tags
                    },
                    { upsert: true, new: true }
                );
                inserted++;
            } catch (err: any) {
                if (err.code === 11000) {
                    // Duplicate key - skip
                    skipped++;
                } else {
                    console.error(`   ⚠️ Error inserting Q${q.questionNumber}:`, err.message);
                    skipped++;
                }
            }
        }

        console.log(`   ✅ Inserted: ${inserted}, Skipped: ${skipped}`);
        totalInserted += inserted;
        totalSkipped += skipped;
    }

    // Get final count
    const finalCount = await JEEQuestionBank.countDocuments();

    // Get chapters summary
    const chaptersSummary = await JEEQuestionBank.aggregate([
        { $group: { _id: { subject: '$subject', chapter: '$chapter' }, count: { $sum: 1 } } },
        { $sort: { '_id.subject': 1, count: -1 } }
    ]);

    console.log('\n📊 Summary:');
    console.log(`   Total Documents: ${finalCount}`);
    console.log(`   Total Inserted: ${totalInserted}`);
    console.log(`   Total Skipped: ${totalSkipped}`);

    console.log('\n📚 Chapters per Subject:');
    const grouped: { [key: string]: string[] } = {};
    for (const c of chaptersSummary) {
        const subj = c._id.subject;
        if (!grouped[subj]) grouped[subj] = [];
        grouped[subj].push(`${c._id.chapter} (${c.count})`);
    }
    for (const subj of Object.keys(grouped)) {
        console.log(`   ${subj}: ${grouped[subj].length} chapters`);
    }

    console.log('\n🎉 Seeding Complete!');
    process.exit(0);
}

seedJEEBank().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
