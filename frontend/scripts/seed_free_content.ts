import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import Models
// Note: We need to define models here inline or import them if ts-node/tsx can handle aliases.
// For simplicity in a script, I'll rely on relative imports or simplified schemas if imports fail.
// Trying relative imports first.
import PYQCategory from '../lib/models/PYQCategory';
import PYQQuestion from '../lib/models/PYQQuestion';
import InterviewGuide from '../lib/models/InterviewGuide';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // --- 1. Seed NSAT General PYQs (2024) ---
        console.log('Seeding NSAT General PYQs...');
        const nsatCategory = await PYQCategory.findOneAndUpdate(
            { slug: 'nsat-2024-free' },
            {
                title: 'NSAT General 2024 (Free Sample)',
                slug: 'nsat-2024-free',
                examType: 'nsat',
                year: 2024,
                description: 'Official sample questions from the 2024 NSAT General Aptitude exam.',
                questionCount: 5,
                isFree: true,
                isActive: true,
                order: 1
            },
            { upsert: true, new: true }
        );

        // Questions for NSAT
        const nsatQuestions = [
            {
                questionNumber: 1,
                section: 'Logical Reasoning',
                questionText: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
                options: [
                    { id: 'a', text: '40' },
                    { id: 'b', text: '42' },
                    { id: 'c', text: '44' },
                    { id: 'd', text: '46' }
                ],
                correctAnswer: 'b',
                explanation: 'The pattern is n(n+1). 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30. Next is 6*7=42.',
                difficulty: 'easy'
            },
            {
                questionNumber: 2,
                section: 'Verbal Ability',
                questionText: 'Choose the synonym of "Ephemeral".',
                options: [
                    { id: 'a', text: 'Lasting' },
                    { id: 'b', text: 'Short-lived' },
                    { id: 'c', text: 'Heavy' },
                    { id: 'd', text: 'Bright' }
                ],
                correctAnswer: 'b',
                explanation: 'Ephemeral means lasting for a very short time.',
                difficulty: 'medium'
            },
            {
                questionNumber: 3,
                section: 'Quantitative',
                questionText: 'If 20% of x is equal to 30% of y, then x:y is:',
                options: [
                    { id: 'a', text: '2:3' },
                    { id: 'b', text: '3:2' },
                    { id: 'c', text: '1:1' },
                    { id: 'd', text: '1:2' }
                ],
                correctAnswer: 'b',
                explanation: '0.2x = 0.3y => x/y = 0.3/0.2 = 3/2.',
                difficulty: 'easy'
            },
            {
                questionNumber: 4,
                section: 'Data Interpretation',
                questionText: 'In a class of 50 students, 30 like Cricket, 20 like Football, and 10 like both. How many like neither?',
                options: [
                    { id: 'a', text: '0' },
                    { id: 'b', text: '5' },
                    { id: 'c', text: '10' },
                    { id: 'd', text: '15' }
                ],
                correctAnswer: 'c',
                explanation: 'Total = Just Cricket + Just Football + Both + Neither. Just Cricket = 30-10=20. Just Football = 20-10=10. Both=10. Total Students who like at least one = 20+10+10 = 40. Neither = 50-40 = 10.',
                difficulty: 'medium'
            },
            {
                questionNumber: 5,
                section: 'Logical Reasoning',
                questionText: 'If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?',
                options: [
                    { id: 'a', text: 'Brother' },
                    { id: 'b', text: 'Nephew/Niece' },
                    { id: 'c', text: 'Uncle' },
                    { id: 'd', text: 'Cousin' }
                ],
                correctAnswer: 'b',
                explanation: 'A (Male) - B (Female) - C (Male) -> D (Child). Since C is A\'s brother (sibling), C\'s child D is A\'s Nephew or Niece.',
                difficulty: 'medium'
            }
        ];

        // Insert questions
        for (const q of nsatQuestions) {
            await PYQQuestion.findOneAndUpdate(
                { categoryId: nsatCategory._id, questionNumber: q.questionNumber },
                { ...q, categoryId: nsatCategory._id },
                { upsert: true }
            );
        }

        // --- 2. Seed Coding NSAT PYQs (2024) ---
        console.log('Seeding Coding NSAT PYQs...');
        const codingCategory = await PYQCategory.findOneAndUpdate(
            { slug: 'coding-nsat-2024-free' },
            {
                title: 'Coding NSAT 2024 (Free Sample)',
                slug: 'coding-nsat-2024-free',
                examType: 'coding-nsat',
                year: 2024,
                description: 'Sample coding challenges from the 2024 technical round.',
                questionCount: 3,
                isFree: true,
                isActive: true,
                order: 1
            },
            { upsert: true, new: true }
        );

        const codingQuestions = [
            {
                questionNumber: 1,
                section: 'Dsa',
                questionText: 'What is the time complexity of binary search on a sorted array?',
                options: [
                    { id: 'a', text: 'O(n)' },
                    { id: 'b', text: 'O(log n)' },
                    { id: 'c', text: 'O(n^2)' },
                    { id: 'd', text: 'O(1)' }
                ],
                correctAnswer: 'b',
                explanation: 'Binary search divides the search space in half each time, leading to O(log n).',
                difficulty: 'easy'
            },
            {
                questionNumber: 2,
                section: 'Dsa',
                questionText: 'Which data structure follows LIFO principle?',
                options: [
                    { id: 'a', text: 'Queue' },
                    { id: 'b', text: 'Stack' },
                    { id: 'c', text: 'Tree' },
                    { id: 'd', text: 'Graph' }
                ],
                correctAnswer: 'b',
                explanation: 'Stack works on Last In First Out (LIFO).',
                difficulty: 'easy'
            },
            {
                questionNumber: 3,
                section: 'Algorithms',
                questionText: 'Which sorting algorithm has the best average case time complexity?',
                options: [
                    { id: 'a', text: 'Bubble Sort' },
                    { id: 'b', text: 'Insertion Sort' },
                    { id: 'c', text: 'Merge Sort' },
                    { id: 'd', text: 'Selection Sort' }
                ],
                correctAnswer: 'c',
                explanation: 'Merge Sort is O(n log n) in all cases. Bubble, Insertion, Selection are O(n^2) on average.',
                difficulty: 'medium'
            }
        ];

        for (const q of codingQuestions) {
            await PYQQuestion.findOneAndUpdate(
                { categoryId: codingCategory._id, questionNumber: q.questionNumber },
                { ...q, categoryId: codingCategory._id },
                { upsert: true }
            );
        }

        // --- 3. Seed Interview Guides ---
        console.log('Seeding Interview Guides...');

        // NSAT Interview Guide
        await InterviewGuide.findOneAndUpdate(
            { slug: 'nsat-interview-guide-free' },
            {
                title: 'NSAT Interview Preparation Guide',
                slug: 'nsat-interview-guide-free',
                guideType: 'nsat',
                description: 'A comprehensive guide to acing the NSAT personal interview, covering behavioural and background questions.',
                content: `### Introduction
The NSAT interview is the final hurdle. It focuses on your personality, communication skills, and clarity of thought.

### Key Focus Areas
1.  **Self-Introduction**: Prepare a crisp 60-second intro.
2.  **Why this college?**: Research the college thoroughly.
3.  **Strengths/Weaknesses**: Be honest but frame weaknesses positively.

### Common Mistakes
-   Being arrogant or argumentative.
-   Faking answers (interviewers can tell).
-   Poor body language.

### Dress Code
Formal attire is recommended. Cleanliness and grooming matter.`,
                tips: [
                    'Maintain eye contact.',
                    'Listen to the question fully before answering.',
                    'Be honest if you don\'t know an answer.',
                    'Smile and be polite.'
                ],
                sampleQuestions: [
                    {
                        question: 'Tell me about yourself.',
                        suggestedAnswer: 'Start with your name, background, academic achievements, and hobbies. Keep it professional.',
                        category: 'Personal'
                    },
                    {
                        question: 'Why do you want to join this institute?',
                        suggestedAnswer: 'Mention specific faculties, alumni success, or campus culture that aligns with your goals.',
                        category: 'Motivation'
                    }
                ],
                isFree: true,
                isActive: true,
                order: 1
            },
            { upsert: true }
        );

        // Coding Interview Guide
        await InterviewGuide.findOneAndUpdate(
            { slug: 'coding-interview-checklist' },
            {
                title: 'Technical Interview Checklist',
                slug: 'coding-interview-checklist',
                guideType: 'coding',
                description: 'Essential checklist for technical interviews including standard algorithms and system design basics.',
                content: `### Algorithm Checklist
Before your interview, ensure you are comfortable with:
-   Arrays & Strings (Two pointers, Sliding window)
-   Hash Maps
-   Linked Lists (Reversal, Cycle detection)
-   Trees (BFS, DFS)
-   Dynamic Programming (Basics)

### Problem Solving Approach
1.  **Clarify**: Ask questions to remove ambiguity.
2.  **Example**: Walk through a test case.
3.  **Brute Force**: State the naive solution first.
4.  **Optimize**: Improve time/space complexity.
5.  **Code**: Write clean, modular code.
6.  **Test**: Dry run your code.`,
                tips: [
                    'Think out loud while coding.',
                    'Handle edge cases (empty input, large input).',
                    'Use meaningful variable names.',
                    'Don\'t give up properly; ask for hints.'
                ],
                sampleQuestions: [
                    {
                        question: 'Reverse a Linked List.',
                        suggestedAnswer: 'Iterative: Use prev, curr, next pointers. Recursive: Head.next.next = head.',
                        category: 'Data Structures'
                    },
                    {
                        question: 'Explain the difference between Process and Thread.',
                        suggestedAnswer: 'Process is an executing program (isolated). Thread is a unit of execution within a process (shared memory).',
                        category: 'OS'
                    }
                ],
                isFree: true,
                isActive: true,
                order: 2
            },
            { upsert: true }
        );

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
