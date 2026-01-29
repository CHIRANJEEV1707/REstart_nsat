/**
 * MathonGo PYQ Extraction Script
 * Extracts questions from JEE Mains Top 500 PYQs PDFs (Mathematics, Physics, Chemistry)
 * 
 * Usage: node scripts/extractMathongoPYQs.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for pdf-parse (CommonJS module)
const pdfParse = (await import('pdf-parse')).default;

const PDF_FILES = [
    { subject: 'Mathematics', file: 'Mathematics - Top 500 PYQs - MathonGo.pdf' },
    { subject: 'Physics', file: 'Physics - Top 500 PYQs - MathonGo.pdf' },
    { subject: 'Chemistry', file: 'Chemistry - Top 500 PYQs - MathonGo.pdf' }
];

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_DIR = path.join(DOCS_DIR, 'extracted');

// Regex patterns
const CHAPTER_REGEX = /^Chapter:\s*(.+)$/m;
const QUESTION_START_REGEX = /^Q(\d+)\.\s*JEE Main (\d{4})\s*\(([^)]+)\)/;
const OPTIONS_REGEX = /\(([1-4])\)\s+([^(]+?)(?=\([1-4]\)|$)/g;

/**
 * Parse a single PDF and extract questions
 */
async function extractFromPDF(subject, filename) {
    const pdfPath = path.join(DOCS_DIR, filename);
    console.log(`\n📖 Processing: ${filename}`);

    if (!fs.existsSync(pdfPath)) {
        console.error(`   ❌ File not found: ${pdfPath}`);
        return [];
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    console.log(`   Pages: ${pdfData.numpages}`);

    const text = pdfData.text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    const questions = [];
    let currentChapter = 'General';
    let currentQuestion = null;
    let collectingQuestion = false;
    let questionBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for chapter header
        const chapterMatch = line.match(CHAPTER_REGEX);
        if (chapterMatch) {
            currentChapter = chapterMatch[1].trim();
            continue;
        }

        // Check for question start
        const qMatch = line.match(QUESTION_START_REGEX);
        if (qMatch) {
            // Save previous question if exists
            if (currentQuestion && questionBuffer.length > 0) {
                const parsed = parseQuestionBuffer(currentQuestion, questionBuffer);
                if (parsed) {
                    questions.push(parsed);
                }
            }

            // Start new question
            currentQuestion = {
                questionNumber: parseInt(qMatch[1]),
                year: parseInt(qMatch[2]),
                shift: qMatch[3].trim(),
                chapter: currentChapter,
                subject: subject
            };
            questionBuffer = [];
            collectingQuestion = true;

            // Get remaining text after the match
            const remaining = line.substring(line.indexOf(')') + 1).trim();
            if (remaining) {
                questionBuffer.push(remaining);
            }
            continue;
        }

        // Skip footer lines
        if (line.includes('MathonGo') ||
            line.includes('MARKS App') ||
            line.includes('getmarks.app') ||
            line.includes('Text & Video Solutions')) {
            continue;
        }

        // Collect question content
        if (collectingQuestion && currentQuestion) {
            questionBuffer.push(line);
        }
    }

    // Don't forget the last question
    if (currentQuestion && questionBuffer.length > 0) {
        const parsed = parseQuestionBuffer(currentQuestion, questionBuffer);
        if (parsed) {
            questions.push(parsed);
        }
    }

    console.log(`   ✅ Extracted ${questions.length} questions`);
    return questions;
}

/**
 * Parse the collected buffer for a single question
 */
function parseQuestionBuffer(metadata, buffer) {
    const fullText = buffer.join(' ');

    // Try to find options
    const options = [];
    const optionsMatches = [...fullText.matchAll(OPTIONS_REGEX)];

    let questionText = fullText;
    let isInteger = false;

    if (optionsMatches.length >= 2) {
        // Find where options start
        const firstOptIndex = fullText.indexOf('(1)');
        if (firstOptIndex > 0) {
            questionText = fullText.substring(0, firstOptIndex).trim();
        }

        // Extract options
        for (const match of optionsMatches) {
            options.push({
                id: match[1],
                text: match[2].trim()
            });
        }
    } else {
        // Integer type question
        isInteger = true;
        // Clean up any trailing text that might be part of footer
        questionText = fullText.replace(/\([1-4]\)\s*\d*\s*$/g, '').trim();
    }

    // Skip if question text is too short (likely parsing error)
    if (questionText.length < 10) {
        return null;
    }

    // Determine difficulty based on year (heuristic)
    let difficulty = 'medium';
    if (metadata.year >= 2024) difficulty = 'hard';
    else if (metadata.year <= 2021) difficulty = 'easy';

    return {
        subject: metadata.subject,
        chapter: metadata.chapter,
        questionNumber: metadata.questionNumber,
        year: metadata.year,
        shift: metadata.shift,
        questionText: questionText,
        options: options,
        correctAnswer: '', // Will need manual annotation or answer key
        isInteger: isInteger,
        difficulty: difficulty,
        tags: [metadata.chapter]
    };
}

/**
 * Main extraction function
 */
async function main() {
    console.log('🚀 MathonGo PYQ Extraction Starting...\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let totalQuestions = 0;

    for (const { subject, file } of PDF_FILES) {
        const questions = await extractFromPDF(subject, file);

        const outputPath = path.join(OUTPUT_DIR, `jee_${subject.toLowerCase()}_questions.json`);
        fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
        console.log(`   💾 Saved to: ${outputPath}`);

        totalQuestions += questions.length;
    }

    console.log(`\n🎉 Extraction Complete!`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Output Directory: ${OUTPUT_DIR}`);
}

main().catch(err => {
    console.error('❌ Extraction failed:', err);
    process.exit(1);
});
