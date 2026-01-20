
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Question from '../models/Question';
import MockTest from '../models/MockTest';

dotenv.config();

const DATA_JSON_PATH = path.join(process.cwd(), '../temp_data/jee_pyqs_shallow/data.json');

// Helper to convert slug to Title Case
const titleCase = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const mapSubject = (sub: string) => {
    if (sub.toLowerCase() === 'mathematics') return 'Mathematics';
    if (sub.toLowerCase() === 'physics') return 'Physics';
    if (sub.toLowerCase() === 'chemistry') return 'Chemistry';
    return titleCase(sub);
};

// Map extract type to DB type
const mapType = (type: string) => {
    if (type === 'mcq') return 'MCQ';
    if (type === 'integer') return 'INTEGER';
    return 'MCQ'; // Default
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    if (!fs.existsSync(DATA_JSON_PATH)) {
        console.error(`Data file not found at ${DATA_JSON_PATH}`);
        process.exit(1);
    }

    console.log('Reading data.json...');
    const rawData = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
    const data = JSON.parse(rawData);

    console.log('Grouping Data by Paper...');
    const papers: { [key: string]: any[] } = {};

    for (const chapterSlug in data) {
        const chapterObj = data[chapterSlug];
        const qDict = chapterObj.question_dict;
        if (!qDict) continue;

        const subject = mapSubject(chapterObj.parent_subject || 'Unknown');
        const chapterName = titleCase(chapterObj.name || chapterSlug);

        for (const qId in qDict) {
            const qData = qDict[qId];
            const paperTitle = qData.paperTitle || 'Generic Question Bank';

            if (!papers[paperTitle]) papers[paperTitle] = [];

            papers[paperTitle].push({
                ...qData,
                __meta: { subject, chapterName }
            });
        }
    }

    console.log(`Found ${Object.keys(papers).length} papers. Starting ingestion...`);

    let totalQ = 0;

    for (const title of Object.keys(papers)) {
        const questionsList = papers[title];
        if (questionsList.length === 0) continue;

        // 1. Create MockTest
        let shift = 'Morning';
        if (title.includes('Evening')) shift = 'Evening';

        // Extract Year from title (e.g. "JEE Main 2024 ...")
        const yearMatch = title.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : 2024;

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Calculate sections
        const subjectCounts: { [key: string]: number } = {};
        questionsList.forEach(q => {
            const sub = q.__meta.subject;
            subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
        });

        const sections = Object.keys(subjectCounts).map(sub => ({
            name: sub,
            questionCount: subjectCounts[sub],
            marks: subjectCounts[sub] * 4
        }));

        const totalMarks = questionsList.length * 4;

        // Create or Update MockTest
        const mockTest = await MockTest.findOneAndUpdate(
            { slug: slug },
            {
                title: title,
                slug: slug,
                description: `Official JEE Mains PYQ Paper: ${title}`,
                examType: 'jee-mains',
                duration: 180,
                totalMarks: totalMarks,
                sections: sections,
                isFree: true,
                isPYQ: true,
                year: year,
                shift: shift,
                isActive: true
            },
            { upsert: true, new: true }
        );

        // 2. Insert Questions
        for (const qData of questionsList) {
            const options = (qData.options || []).map((opt: any) => ({
                id: opt.identifier || String(Math.random()),
                text: opt.content || ''
            }));

            // Correct Answer Mapping: identifier (e.g. "A") -> options id
            // But strict Schema requires 'correctAnswer' string.
            // If MCQ, it's optionId.
            // Extracted data has "correct_options": ["A"]
            // If "A" matches option identifier "A", we use that option's ID (which is "A").
            const correctOpt = (qData.correct_options && qData.correct_options.length > 0) ? qData.correct_options[0] : null;
            let finalAnswer = qData.answer; // For integer
            if (mapType(qData.type) === 'MCQ' && correctOpt) {
                finalAnswer = correctOpt;
            }

            const qDoc = {
                mockTestId: mockTest._id,
                section: qData.__meta.subject,
                questionNumber: totalQ + 1, // Global or per paper? Per paper usually.
                // Resetting numbering per paper would be better but complex here.
                // Just random incremental is okay for now or 0.
                questionText: qData.question,
                questionType: mapType(qData.type).toLowerCase() as any,
                options: options,
                correctAnswer: finalAnswer || 'N/A',
                explanation: qData.explanation,
                marks: 4,
                negativeMarks: 1,
                difficulty: (qData.difficulty || 'medium').toLowerCase(),
                subject: qData.__meta.subject,
                chapter: qData.__meta.chapterName,
                topic: titleCase(qData.topic || ''),
                sourceId: qData.question_id,
                isCoding: false
            };

            await Question.findOneAndUpdate(
                { sourceId: qData.question_id },
                qDoc,
                { upsert: true }
            );
            totalQ++;
        }
        process.stdout.write('.');
    }

    console.log(`\nDone! Processed ${totalQ} questions.`);
    process.exit(0);
};

seed();
