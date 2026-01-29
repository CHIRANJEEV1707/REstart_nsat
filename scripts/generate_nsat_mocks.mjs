#!/usr/bin/env node
/**
 * Generate 12 NSAT General Mocks from the question pool
 * Each mock has 80 questions across 6 sections
 * Questions are never repeated across mocks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Section configuration for NSAT General Mock
const SECTIONS = [
    { name: 'Mathematics (Class 10)', subject: 'basic-maths', count: 15, marks: 60 },
    { name: 'Mathematics (Class 11-12)', subject: 'advanced-maths', count: 15, marks: 60 },
    { name: 'Logic & Data Interpretation', subject: 'general-aptitude', count: 20, marks: 80 },
    { name: 'Algorithmic Thinking', subject: 'general-aptitude', count: 10, marks: 40 },
    { name: 'Reading Comprehension', subject: 'english-bSxcKFmk', count: 10, marks: 40 },
    { name: 'Language Reasoning', subject: 'english-bSxcKFmk', count: 10, marks: 40 }
];

const TOTAL_MOCKS = 12;
const QUESTIONS_PER_MOCK = 80;

// Tier mapping: which mocks belong to which bundle tier
const TIER_MAP = {
    1: 'basic', 2: 'basic', 3: 'basic',
    4: 'core', 5: 'core', 6: 'core', 7: 'core', 8: 'core',
    9: 'premium', 10: 'premium', 11: 'premium', 12: 'premium'
};

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function loadQuestions() {
    const filePath = path.join(projectRoot, 'nsat_questions_with_answers.json');
    console.log(`📂 Loading questions from: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`   Total questions loaded: ${data.length}`);
    return data;
}

function groupBySubject(questions) {
    const grouped = {};
    for (const q of questions) {
        const subj = q.subject || 'unknown';
        if (!grouped[subj]) grouped[subj] = [];
        grouped[subj].push(q);
    }

    console.log('\n📊 Questions by subject:');
    for (const [subj, qs] of Object.entries(grouped)) {
        console.log(`   ${subj}: ${qs.length}`);
    }

    return grouped;
}

function transformQuestion(q, section, questionNumber) {
    // Parse correct answer - map letter to option ID
    let correctAnswer = '1';
    if (q.correct_answer) {
        const letterMap = { 'A': '1', 'B': '2', 'C': '3', 'D': '4', 'E': '5' };
        correctAnswer = letterMap[q.correct_answer.toUpperCase()] || '1';
    } else if (q.correct_choice_num) {
        correctAnswer = String(q.correct_choice_num);
    }

    // Build options array
    const options = [];
    for (const letter of ['A', 'B', 'C', 'D', 'E']) {
        const text = q[`choice_${letter}_text`];
        const image = q[`choice_${letter}_image`];
        if (text || image) {
            options.push({
                id: String(options.length + 1),
                text: text || '',
                image: image || null
            });
        }
    }

    // Determine difficulty
    let difficulty = 'medium';
    const mainTopic = (q.main_topic || '').toLowerCase();
    if (mainTopic.includes('basic') || mainTopic.includes('class 10')) {
        difficulty = 'easy';
    } else if (mainTopic.includes('advanced')) {
        difficulty = 'hard';
    }

    return {
        section,
        questionNumber,
        questionText: q.question_text || '',
        questionImage: q.question_thumbnail || null,
        questionType: 'mcq',
        difficulty,
        topics: q.topic_slugs || [],
        marks: 4,
        negativeMarks: 1,
        options,
        correctAnswer,
        explanation: q.explanation || null,
        hash: q.hash // Keep for reference
    };
}

function generateMocks(allQuestions) {
    const grouped = groupBySubject(allQuestions);

    // Shuffle each subject's questions
    const pools = {};
    for (const [subj, qs] of Object.entries(grouped)) {
        pools[subj] = shuffleArray(qs);
    }

    // Track usage indices per subject
    const indices = {};
    for (const subj of Object.keys(pools)) {
        indices[subj] = 0;
    }

    const mocks = [];

    for (let mockNum = 1; mockNum <= TOTAL_MOCKS; mockNum++) {
        console.log(`\n🔨 Generating Mock ${mockNum}...`);

        const questions = [];
        let questionNumber = 1;

        for (const section of SECTIONS) {
            const pool = pools[section.subject];
            const startIdx = indices[section.subject];
            const endIdx = startIdx + section.count;

            if (endIdx > pool.length) {
                console.error(`❌ Not enough questions for ${section.subject}! Have ${pool.length}, need ${endIdx}`);
                process.exit(1);
            }

            const sectionQuestions = pool.slice(startIdx, endIdx);
            indices[section.subject] = endIdx;

            for (const q of sectionQuestions) {
                questions.push(transformQuestion(q, section.name, questionNumber++));
            }

            console.log(`   ✓ ${section.name}: ${section.count} questions`);
        }

        const mock = {
            title: `NSAT General Mock Test ${String(mockNum).padStart(2, '0')}`,
            slug: `nsat-general-mock-${String(mockNum).padStart(2, '0')}`,
            description: `Complete NSAT General mock test #${mockNum} with realistic exam experience. 80 questions across 6 sections.`,
            examType: 'nsat',
            duration: 180,
            totalMarks: 320,
            passingMarks: 0,
            sections: SECTIONS.map(s => ({
                name: s.name,
                questionCount: s.count,
                marks: s.marks
            })),
            instructions: [
                'Total duration: 180 minutes',
                'Marking scheme: +4 for correct, -1 for incorrect',
                'Answer all questions - no optional sections',
                'Calculator is NOT allowed',
                'Test is proctored via webcam and microphone'
            ],
            isFree: mockNum <= 1, // Only first mock is free
            isPremium: mockNum > 1,
            isActive: true,
            difficulty: 'medium',
            isPYQ: false,
            order: mockNum,
            requiredBundle: TIER_MAP[mockNum],
            testCategory: 'general',
            questions
        };

        mocks.push(mock);
    }

    return mocks;
}

function saveMocks(mocks) {
    const outputDir = path.join(projectRoot, 'docs/generated_mocks');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Remove old generated mocks
    const existingFiles = fs.readdirSync(outputDir);
    for (const file of existingFiles) {
        if (file.startsWith('nsat_general_mock_')) {
            fs.unlinkSync(path.join(outputDir, file));
            console.log(`🗑️  Removed old: ${file}`);
        }
    }

    // Save new mocks
    for (const mock of mocks) {
        const fileName = `${mock.slug.replace(/-/g, '_')}.json`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(mock, null, 2));
        console.log(`💾 Saved: ${fileName} (${mock.questions.length} questions)`);
    }

    console.log(`\n✅ Generated ${mocks.length} mocks in ${outputDir}`);
}

function printSummary(mocks) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));

    console.log('\nTier Distribution:');
    const tiers = { basic: [], core: [], premium: [] };
    for (const mock of mocks) {
        tiers[mock.requiredBundle].push(mock.slug);
    }
    console.log(`  Basic (1-3):   ${tiers.basic.length} mocks`);
    console.log(`  Core (4-8):    ${tiers.core.length} mocks`);
    console.log(`  Premium (9-12): ${tiers.premium.length} mocks`);

    console.log('\nTotal Questions: ' + (mocks.length * QUESTIONS_PER_MOCK));
    console.log('\nNext step: Run the ingestion script to load these into MongoDB');
    console.log('  node scripts/ingest_new_mocks.mjs');
}

// Main
console.log('🚀 NSAT Mock Generator');
console.log('='.repeat(60));

const questions = loadQuestions();
const mocks = generateMocks(questions);
saveMocks(mocks);
printSummary(mocks);
