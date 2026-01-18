import mongoose from 'mongoose';
import dbConnect from '../lib/db';
import Exam from '../lib/models/Exam';
import College from '../lib/models/College';
import PYQCategory from '../lib/models/PYQCategory';
import PYQQuestion from '../lib/models/PYQQuestion';

// Sample Data

const EXAMS = [
  {
    name: 'JEE Mains',
    code: 'jee-mains',
    description: 'Joint Entrance Examination Main',
    dates: {
      registration_start: new Date('2025-11-01'),
      registration_end: new Date('2025-11-30'),
      exam_date_start: new Date('2026-01-24'),
      exam_date_end: new Date('2026-02-01')
    },
    eligibility: 'Class 12th Pass or Appearing',
    website: 'https://jeemain.nta.ac.in',
  },
  {
    name: 'JEE Advanced',
    code: 'jee-advanced',
    description: 'Joint Entrance Examination Advanced',
    dates: {
      registration_start: new Date('2026-04-21'),
      registration_end: new Date('2026-04-30'),
      exam_date_start: new Date('2026-05-26'),
      exam_date_end: new Date('2026-05-26')
    },
    eligibility: 'Top 2.5 Lakh rank in JEE Main',
    website: 'https://jeeadv.ac.in',
  },
  {
    name: 'BITSAT',
    code: 'bitsat',
    description: 'Birla Institute of Technology and Science Admission Test',
    dates: {
      registration_start: new Date('2026-01-15'),
      registration_end: new Date('2026-04-11'),
      exam_date_start: new Date('2026-05-19'),
      exam_date_end: new Date('2026-05-24')
    },
    eligibility: 'Class 12th with 75% aggregate in PCM',
    website: 'https://bitsadmission.com',
  }
];

const COLLEGES = [
  {
    name: 'NIT Trichy',
    location: { state: 'Tamil Nadu', city: 'Tiruchirappalli' },
    type: 'Institute of National Importance',
    fees: 150000,
    exams_required: ['jee-mains'],
    restart_score: 8,
    badges: ['Top NIT', 'Best Placements'],
    country: 'India',
    isTrending: true,
    trendingScore: 95
  },
  {
    name: 'IIT Bombay',
    location: { state: 'Maharashtra', city: 'Mumbai' },
    type: 'Institute of National Importance',
    fees: 200000,
    exams_required: ['jee-advanced'],
    restart_score: 9,
    badges: ['Top IIT', 'Dream College'],
    country: 'India',
    isTrending: true,
    trendingScore: 100
  },
  {
    name: 'BITS Pilani',
    location: { state: 'Rajasthan', city: 'Pilani' },
    type: 'Private University',
    fees: 500000,
    exams_required: ['bitsat'],
    restart_score: 9,
    badges: ['No Reservation', 'Tier 1 Private'],
    country: 'India',
    isTrending: true,
    trendingScore: 90
  },
  {
    name: 'IIIT Hyderabad',
    location: { state: 'Telangana', city: 'Hyderabad' },
    type: 'Private University', // Actually IIIT-H is distinct but fitting schema
    fees: 300000,
    exams_required: ['jee-mains'],
    restart_score: 9,
    badges: ['Coding Culture', 'Top Placements'],
    country: 'India',
    isTrending: true,
    trendingScore: 92
  }
];

const QUESTIONS_TEMPLATE = [
  {
    text: "Calculate the electric field at a distance r from an infinite line charge of linear charge density λ.",
    subject: "Physics",
    topics: ["Electrostatics", "Gauss Law"],
    difficulty: "medium",
    options: [
      { id: "A", text: "λ / (2πε₀r)" },
      { id: "B", text: "λ / (4πε₀r)" },
      { id: "C", text: "2λ / (ε₀r)" },
      { id: "D", text: "Zero" }
    ],
    correctAnswer: "A",
    explanation: "Using Gauss law with a cylindrical surface, E * 2πrl = λl/ε₀ => E = λ/(2πε₀r)."
  },
  {
    text: "Which of the following compounds will undergo Cannizzaro reaction?",
    subject: "Chemistry",
    topics: ["Aldehydes", "Organic Chemistry"],
    difficulty: "easy",
    options: [
      { id: "A", text: "Acetaldehyde" },
      { id: "B", text: "Formaldehyde" },
      { id: "C", text: "Acetone" },
      { id: "D", text: "Ethyl Alcohol" }
    ],
    correctAnswer: "B",
    explanation: "Aldehydes without alpha-hydrogens (like Formaldehyde HCHO) undergo Cannizzaro reaction."
  },
  {
    text: "If f(x) = x^3 - 3x + 2, then the local minimum value is at x = ?",
    subject: "Math",
    topics: ["Calculus", "Derivatives"],
    difficulty: "easy",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "-1" },
      { id: "C", text: "0" },
      { id: "D", text: "2" }
    ],
    correctAnswer: "A",
    explanation: "f'(x) = 3x^2 - 3. Roots are ±1. f''(x) = 6x. f''(1) = 6 > 0 (Minima). f''(-1) = -6 < 0 (Maxima)."
  }
];

async function seed() {
  await dbConnect();
  console.log('Connected to DB');

  // 1. Exams
  for (const exam of EXAMS) {
    await Exam.findOneAndUpdate({ code: exam.code }, exam, { upsert: true, new: true });
    console.log(`Upserted Exam: ${exam.name}`);
  }

  // 2. Colleges
  for (const college of COLLEGES) {
    await College.findOneAndUpdate({ name: college.name }, college, { upsert: true, new: true });
    console.log(`Upserted College: ${college.name}`);
  }

  // 3. PYQ Categories & Questions
  const examTypes = ['jee-mains', 'jee-advanced', 'bitsat'];
  const years = [2023, 2024];

  for (const type of examTypes) {
    for (const year of years) {
      const slug = `${type}-${year}-paper-1`;
      const categoryData = {
        title: `${type.toUpperCase()} ${year} Paper 1`,
        slug: slug,
        examType: type as any,
        year: year,
        description: `Official question paper for ${type} ${year}`,
        questionCount: 10,
        isActive: true
      };

      const category = await PYQCategory.findOneAndUpdate(
        { slug: slug },
        categoryData,
        { upsert: true, new: true }
      );
      console.log(`Upserted Category: ${slug}`);

      // Add Questions
      // Clear existing for this category to avoid dupes on re-run
      await PYQQuestion.deleteMany({ categoryId: category._id });

      for (let i = 0; i < 10; i++) {
        const template = QUESTIONS_TEMPLATE[i % QUESTIONS_TEMPLATE.length];
        await PYQQuestion.create({
          categoryId: category._id,
          questionNumber: i + 1,
          section: template.subject, // Map subject to section
          questionText: `${template.text} (Variant ${i})`,
          options: template.options,
          correctAnswer: template.correctAnswer,
          explanation: template.explanation,
          difficulty: template.difficulty,
          tags: [...template.topics, type, year.toString()]
        });
      }
      console.log(`Added 10 questions for ${slug}`);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
