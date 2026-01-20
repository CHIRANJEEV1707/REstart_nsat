import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MockTest from '../lib/models/MockTest';
import Question from '../lib/models/Question';
import dbConnect from '../lib/db';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'nsat_parsed.json');

// Helper to extract options from text if missing
function extractInlineOptions(text: string) {
  const opts: { id: string, text: string }[] = [];
  const regex = /\(([A-E1-5])\)\s*([^(\n]*)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    opts.push({
      id: match[1],
      text: match[2].trim()
    });
  }
  return opts;
}

async function ingest() {
  await dbConnect();

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  const jsonData = JSON.parse(rawData);

  console.log(`Loaded ${jsonData.questions.length} questions.`);

  // 1. Create Mock Test
  const mockTest = new MockTest({
    title: "NSAT Full Mock Test 01",
    slug: "nsat-mock-01",
    description: "Official NSAT Mock Test ingested from PDF.",
    examType: "nsat",
    duration: 180, // 3 hours assumption
    totalMarks: 300, // Assumption
    passingMarks: 100,
    isFree: true,
    isActive: true,
    difficulty: "medium",
    instructions: [
      "Total duration is 180 minutes.",
      "Each question carries 4 marks.",
      "Negative marking of -1 for incorrect answers."
    ],
    sections: [
      { name: "General", questionCount: 0, marks: 0 }, // Will update later
      { name: "Mathematics", questionCount: 0, marks: 0 }, // Will update later
    ]
  });

  // Check if exists
  const existing = await MockTest.findOne({ slug: mockTest.slug });
  if (existing) {
    console.log("Mock Test already exists. Removing old questions...");
    await Question.deleteMany({ mockTestId: existing._id });
    await MockTest.deleteOne({ _id: existing._id });
  }

  const savedTest = await mockTest.save();
  console.log(`Created Mock Test: ${savedTest.title} (${savedTest._id})`);

  // 2. Insert Questions
  let qCount = 0;
  // Sections map for stats
  const sectionStats: Record<string, number> = {};

  for (const q of jsonData.questions) {
    if (!q.text || q.text.trim().length === 0) {
      console.warn(`Skipping Q${q.id} due to empty text.`);
      continue;
    }

    // Determine section (fallback to 'General' if missing)
    const sectionName = q.section || "General";

    // Map options correctly
    let options = q.options.map((opt: any) => ({
      id: opt.id.replace(/[\(\)]/g, ''), // Clean (A) -> A
      text: opt.text
    }));

    // FALLBACK: If options are empty, try to parse from text
    if (options.length === 0) {
      options = extractInlineOptions(q.text);
    }

    // Clean Answer
    let answer = q.answer ? q.answer.toString().replace(/[\(\)]/g, '') : "A"; // Default if missing, but log warning
    if (!q.answer && options.length > 0) {
      // Simple heuristic if no answer found: assume 'A' or explicit field missing
    }

    // Create Question
    await Question.create({
      mockTestId: savedTest._id,
      section: sectionName,
      questionNumber: q.id,
      questionText: q.text,
      questionType: 'mcq',
      options: options,
      correctAnswer: answer,
      explanation: q.explanation,
      marks: 4,
      negativeMarks: -1,
      difficulty: 'medium',
      tags: [],
      images: q.images || []
    });

    // Update stats
    sectionStats[sectionName] = (sectionStats[sectionName] || 0) + 1;
    qCount++;
  }

  // 3. Update Mock Test Section Stats
  const updatedSections = Object.entries(sectionStats).map(([name, count]) => ({
    name,
    questionCount: count,
    marks: count * 4
  }));

  savedTest.sections = updatedSections;
  savedTest.totalMarks = updatedSections.reduce((acc, curr) => acc + curr.marks, 0);
  await savedTest.save();

  console.log(`Ingested ${qCount} questions successfully.`);
  console.log(`Sections:`, updatedSections);

  process.exit(0);
}

ingest().catch(err => {
  console.error(err);
  process.exit(1);
});
