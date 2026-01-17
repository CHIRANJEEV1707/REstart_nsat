import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MockTest from '../models/MockTest';
import Question from '../models/Question';
import PYQCategory from '../models/PYQCategory';
import PYQQuestion from '../models/PYQQuestion';
import InterviewGuide from '../models/InterviewGuide';

dotenv.config();

import fs from 'fs';
import path from 'path';

// Load env from frontend/.env.local manually to ensure we get the right URI
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
        } else {
            console.log('frontend/.env.local not found');
        }
    } catch (e) {
        console.error('Error loading env:', e);
    }
};

loadFrontendEnv();

const seed = async () => {
    try {
        let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart';

        // Clean up URI if it has trailing issues (handled by mongoose usually but safeguards help)
        if (uri.endsWith('=') && uri.includes('appName')) {
            // Sometimes check issues, but let's just log
        }

        console.log(`Connecting to MongoDB...`);

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Clear existing NSAT data
        await MockTest.deleteMany({});
        await Question.deleteMany({});
        await PYQCategory.deleteMany({});
        await PYQQuestion.deleteMany({});
        await InterviewGuide.deleteMany({});
        console.log('Cleared existing NSAT data');

        // --- 1. NSAT General (Free) ---
        const nsatGeneral = await MockTest.create({
            title: 'NSAT General Aptitude 2024',
            slug: 'nsat-general-aptitude-2024',
            examType: 'nsat',
            duration: 45,
            totalMarks: 60,
            description: 'Comprehensive aptitude test covering Logical Reasoning, Verbal Ability, and Quantitative aptitude. Essential for initial screening rounds.',
            isFree: true,
            isPremium: false,
            sections: [
                { name: 'Logical Reasoning', questionCount: 5, marks: 20 },
                { name: 'Verbal Ability', questionCount: 5, marks: 20 },
                { name: 'Quantitative', questionCount: 5, marks: 20 }
            ]
        });

        const generalQuestions = [
            // Logical
            {
                section: 'Logical Reasoning',
                text: 'Pointing to a photograph of a boy Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
                options: [{ id: 'a', text: 'Brother' }, { id: 'b', text: 'Uncle' }, { id: 'c', text: 'Cousin' }, { id: 'd', text: 'Father' }],
                correct: 'd',
                expl: 'The boy is the son of the only son of Suresh\'s mother. The only son of Suresh\'s mother is Suresh himself. So, the boy is the son of Suresh.'
            },
            {
                section: 'Logical Reasoning',
                text: 'If A + B means A is the mother of B; A - B means A is the brother B; A % B means A is the father of B and A x B means A is the sister of B, which of the following shows that P is the maternal uncle of Q?',
                options: [{ id: 'a', text: 'Q - N + M x P' }, { id: 'b', text: 'P + S x N - Q' }, { id: 'c', text: 'P - M + N x Q' }, { id: 'd', text: 'Q - S % P' }],
                correct: 'c',
                expl: 'P - M -> P is brother of M. M + N -> M is mother of N. N x Q -> N is sister of Q. So M is mother of Q, and P is brother of M. Thus P is maternal uncle.'
            },
            // Verbal
            {
                section: 'Verbal Ability',
                text: 'Select the synonym of: CANDID',
                options: [{ id: 'a', text: 'Apparent' }, { id: 'b', text: 'Explicit' }, { id: 'c', text: 'Frank' }, { id: 'd', text: 'Bright' }],
                correct: 'c',
                expl: 'Candid means truthful and straightforward; frank.'
            },
            {
                section: 'Verbal Ability',
                text: 'Fill in the blank: The unruly behavior of the students _____ the teacher.',
                options: [{ id: 'a', text: 'incensed' }, { id: 'b', text: 'tempered' }, { id: 'c', text: 'aggrieved' }, { id: 'd', text: 'clashed' }],
                correct: 'a',
                expl: 'Incensed means very angry; enraged.'
            },
            // Quant
            {
                section: 'Quantitative',
                text: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
                options: [{ id: 'a', text: '120 metres' }, { id: 'b', text: '180 metres' }, { id: 'c', text: '324 metres' }, { id: 'd', text: '150 metres' }],
                correct: 'd',
                expl: 'Speed = 60*(5/18) = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 meters.'
            }
        ];

        for (const [i, q] of generalQuestions.entries()) {
            await Question.create({
                mockTestId: nsatGeneral._id,
                questionNumber: i + 1,
                section: q.section,
                questionText: q.text,
                questionType: 'mcq',
                options: q.options,
                correctAnswer: q.correct,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium',
                explanation: q.expl
            });
        }
        console.log('Seeded NSAT General (Free)');

        // --- 1.5. Free Coding NSAT (Free) ---
        const freeCodingTest = await MockTest.create({
            title: 'Free Coding Assessment 2025',
            slug: 'free-coding-assessment-2025',
            examType: 'coding-nsat',
            duration: 60,
            totalMarks: 100,
            description: 'A free coding assessment to test your programming skills. Includes basic algorithm questions.',
            isFree: true,
            isPremium: false,
            sections: [
                { name: 'Coding', questionCount: 2, marks: 100 }
            ]
        });

        await Question.create({
            mockTestId: freeCodingTest._id,
            questionNumber: 1,
            section: 'Coding',
            questionText: 'Write a program to check if a number is Prime. (Select Complexity)',
            questionType: 'mcq',
            marks: 50,
            negativeMarks: 0,
            difficulty: 'easy',
            correctAnswer: 'a',
            options: [{ id: 'a', text: 'O(sqrt(n))' }, { id: 'b', text: 'O(n)' }, { id: 'c', text: 'O(1)' }, { id: 'd', text: 'O(n^2)' }],
            testCases: [
                { input: '7', output: 'true', isPublic: true },
                { input: '10', output: 'false', isPublic: true }
            ],
            explanation: 'Iterate from 2 to sqrt(n).'
        } as any);

        await Question.create({
            mockTestId: freeCodingTest._id,
            questionNumber: 2,
            section: 'Coding',
            questionText: 'Write a program to reverse a string. (Select Complexity)',
            questionType: 'mcq',
            marks: 50,
            negativeMarks: 0,
            difficulty: 'easy',
            correctAnswer: 'a',
            options: [{ id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(n^2)' }],
            testCases: [
                { input: 'hello', output: 'olleh', isPublic: true }
            ],
            explanation: 'Swap characters from start and end.'
        } as any);

        console.log('Seeded Free Coding NSAT');


        // --- 2. Coding NSAT (Premium) ---
        const codingTest = await MockTest.create({
            title: 'Newton School Coding Assessment',
            slug: 'newton-school-coding-assessment',
            examType: 'coding-nsat',
            duration: 90,
            totalMarks: 200,
            description: 'Advanced coding assessment focusing on Data Structures and Algorithms. Similar to actual NSAT coding rounds.',
            isFree: false,
            isPremium: true,
            sections: [
                { name: 'Coding', questionCount: 2, marks: 200 }
            ]
        });

        // We use 'mcq' type for now as backend supports MCQ format, 
        // but description implies coding. For this MVP, we use MCQ questions that ASK about code output or logic,
        // unless I implement a full Code Editor question type (which is "coding" type in model).
        // Let's check Question model. It has 'testCases'.
        // I'll create a Coding question.

        await Question.create({
            mockTestId: codingTest._id,
            questionNumber: 1,
            section: 'Coding',
            questionText: 'Write a program to find the longest palindromic substring in a given string. (Mock: Select complexity)',
            questionType: 'mcq', // Using mcq type for now
            marks: 100,
            negativeMarks: 0,
            difficulty: 'hard',
            correctAnswer: 'b', // Dummy answer for MCQ
            options: [{ id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(n^2)' }], // Dummy options
            // Coding question metadata
            testCases: [
                { input: 'babad', output: 'bab', isPublic: true },
                { input: 'cbbd', output: 'bb', isPublic: true }
            ],
            explanation: 'Use Dynamic Programming or Expand Around Center approach. O(n^2).'
        } as any);

        console.log('Seeded Coding NSAT (Premium)');

        // --- 3. Interview Guide ---
        await InterviewGuide.create({
            title: 'Full Stack Developer Interview Guide',
            slug: 'full-stack-guide',
            guideType: 'coding',
            description: 'Complete roadmap and questions for Full Stack roles.',
            content: '# Introduction\nWelcome to the Full Stack guide.\n\n## React.js\n- **Virtual DOM**: ...\n- **Hooks**: ...\n\n## Node.js\n- **Event Loop**: ...',
            isFree: false,
            tips: ['Focus on fundamentals', 'Build a portfolio'],
            sampleQuestions: [
                { question: 'Explain Event Loop in Node.js', suggestedAnswer: 'The event loop allows Node.js to perform non-blocking I/O operations...' }
            ]
        });

        await InterviewGuide.create({
            title: 'Behavioral Interview Masterclass',
            slug: 'behavioral-masterclass',
            guideType: 'nsat',
            description: 'Master the HR round with common behavioral questions and the STAR method.',
            content: '# Behavioral Interviews\n\n## The STAR Method\n- **Situation**\n- **Task**\n- **Action**\n- **Result**',
            isFree: true,
            tips: ['Be honest', 'Use the STAR method', 'Research the company'],
            sampleQuestions: [
                { question: 'Tell me about a time you failed.', suggestedAnswer: 'I once missed a deadline because...' }
            ]
        });
        console.log('Seeded Interview Guide');

        // --- 4. PYQs ---
        const pyqCat = await PYQCategory.create({
            title: 'NSAT Jan 2025 Slot 1',
            slug: 'nsat-jan-2025-slot-1',
            examType: 'nsat',
            year: 2025,
            description: 'Memory based questions from the recent Jan slot.',
            isFree: true
        });

        await PYQQuestion.create({
            categoryId: pyqCat._id,
            questionNumber: 1,
            questionText: 'Given an array of size N, find the majority element.',
            options: [{ id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(n log n)' }],
            correctAnswer: 'a',
            difficulty: 'medium',
            explanation: 'Moore Voting Algorithm'
        });
        console.log('Seeded PYQs');

        console.log('Database seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
