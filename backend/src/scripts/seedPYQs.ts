import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import MockTest from '../models/MockTest'; // Assuming running from dist or src via ts-node
import Question from '../models/Question';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restart_db';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const seedPYQs = async () => {
    await connectDB();

    try {
        // Clear existing PYQs to avoid duplicates (Optional: comment out if appending)
        // await MockTest.deleteMany({ isPYQ: true });
        // await Question.deleteMany({ isPYQ: true }); // Need flag in Question or filter by mockTestId

        // 1. JEE Mains 2024 - Session 1 - Shift 1
        console.log('Seeding JEE Mains 2024...');
        const jee2024 = await MockTest.create({
            title: 'JEE Mains 2024 - Session 1 (Jan 27 Shift 1)',
            slug: 'jee-mains-2024-jan-27-shift-1',
            description: 'Official Question Paper for JEE Mains 2024 Session 1, held on January 27th, Shift 1.',
            examType: 'jee-mains',
            duration: 180,
            totalMarks: 300,
            passingMarks: 100,
            sections: [
                { name: 'Physics', questionCount: 30, marks: 100 },
                { name: 'Chemistry', questionCount: 30, marks: 100 },
                { name: 'Mathematics', questionCount: 30, marks: 100 }
            ],
            instructions: ['Standard JEE Mains marking scheme: +4 for correct, -1 for incorrect.', '30 Questions per subject (20 MCQ + 10 Numerical).'],
            isFree: true,
            isPremium: false,
            isActive: true,
            difficulty: 'hard',
            isPYQ: true,
            year: 2024,
            shift: 'Jan 27 Shift 1',
            order: 1
        });

        // Add Questions for JEE 2024
        const jeeQuestions = [
            // Physics
            {
                section: 'Physics', text: 'A particle moves with simple harmonic motion in a straight line. In first τ s, after starting from rest it travels a distance a, and in next τ s it travels 2a, in same direction. Then:',
                options: [{ id: 'A', text: 'Amplitude of motion is 3a' }, { id: 'B', text: 'Time period of oscillations is 6τ' }, { id: 'C', text: 'Amplitude of motion is 4a' }, { id: 'D', text: 'Time period of oscillations is 8τ' }],
                correct: 'B', topic: 'Simple Harmonic Motion', chapter: 'Oscillations', subject: 'Physics'
            },
            {
                section: 'Physics', text: 'The moment of inertia of a thin rod of mass M and length L about an axis passing through one end and perpendicular to its length is:',
                options: [{ id: 'A', text: 'ML²/12' }, { id: 'B', text: 'ML²/3' }, { id: 'C', text: 'ML²/2' }, { id: 'D', text: 'ML²/4' }],
                correct: 'B', topic: 'Moment of Inertia', chapter: 'Rotational Motion', subject: 'Physics'
            },
            // Chemistry
            {
                section: 'Chemistry', text: 'Which of the following has the highest magnetic moment?',
                options: [{ id: 'A', text: '[Fe(H2O)6]3+' }, { id: 'B', text: '[Fe(CN)6]3-' }, { id: 'C', text: '[Mn(CN)6]3-' }, { id: 'D', text: '[Co(NH3)6]3+' }],
                correct: 'A', topic: 'Coordination Compounds', chapter: 'Coordination Chemistry', subject: 'Chemistry'
            },
            // Maths
            {
                section: 'Mathematics', text: 'The number of integral values of k for which the equation 3sinx + 4cosx = k + 1 has a solution is:',
                options: [{ id: 'A', text: '9' }, { id: 'B', text: '10' }, { id: 'C', text: '11' }, { id: 'D', text: '13' }],
                correct: 'C', topic: 'Trigonometric Equations', chapter: 'Trigonometry', subject: 'Mathematics'
            }
        ];

        for (const [idx, q] of jeeQuestions.entries()) {
            await Question.create({
                mockTestId: jee2024._id,
                section: q.section,
                questionNumber: idx + 1,
                questionText: q.text,
                questionType: 'mcq',
                options: q.options,
                correctAnswer: q.correct,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium',
                subject: q.subject,
                chapter: q.chapter,
                tags: [q.topic]
            });
        }


        // 2. NEET 2024
        console.log('Seeding NEET 2024...');
        const neet2024 = await MockTest.create({
            title: 'NEET 2024 - Official Paper',
            slug: 'neet-2024-official',
            description: 'Official Question Paper for NEET (UG) 2024.',
            examType: 'neet',
            duration: 200,
            totalMarks: 720,
            passingMarks: 150,
            sections: [
                { name: 'Physics', questionCount: 45, marks: 180 },
                { name: 'Chemistry', questionCount: 45, marks: 180 },
                { name: 'Biology', questionCount: 90, marks: 360 }
            ],
            isFree: true,
            isPYQ: true,
            year: 2024,
            shift: 'Standard',
            order: 1
        });

        const neetQuestions = [
            {
                section: 'Biology', text: 'Examples of homologous structures do NOT include:',
                options: [{ id: 'A', text: 'Wings of a bat and forelimb of a horse' }, { id: 'B', text: 'Wings of a bird and wings of a butterfly' }, { id: 'C', text: 'Flippers of a whale and forelimb of a cheetah' }, { id: 'D', text: 'Thorn of Bougainvillea and lead tendril of Cucurbita' }],
                correct: 'B', topic: 'Evolutionary Biology', chapter: 'Evolution', subject: 'Biology'
            },
            {
                section: 'Physics', text: 'Two bodies of mass 4kg and 6kg are tied to the ends of a massless string. The string passes over a pulley which is frictionless... acceleration is:',
                options: [{ id: 'A', text: 'g/2' }, { id: 'B', text: 'g/5' }, { id: 'C', text: 'g/10' }, { id: 'D', text: 'g' }],
                correct: 'B', topic: 'Laws of Motion', chapter: 'Mechanics', subject: 'Physics'
            }
        ];

        for (const [idx, q] of neetQuestions.entries()) {
            await Question.create({
                mockTestId: neet2024._id,
                section: q.section,
                questionNumber: idx + 1,
                questionText: q.text,
                questionType: 'mcq',
                options: q.options,
                correctAnswer: q.correct,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium',
                subject: q.subject,
                chapter: q.chapter,
                tags: [q.topic]
            });
        }

        // 3. NSAT Coding Mock
        console.log('Seeding NSAT Coding PYQ...');
        const nsat2024 = await MockTest.create({
            title: 'NSAT Coding 2024 - Sample Paper',
            slug: 'nsat-coding-2024-pyq',
            description: 'Previous year sample coding questions for NSAT.',
            examType: 'nsat',
            duration: 60,
            totalMarks: 100,
            passingMarks: 40,
            sections: [
                { name: 'Coding', questionCount: 2, marks: 100 }
            ],
            isFree: true,
            isPYQ: true,
            year: 2024,
            order: 1
        });

        await Question.create({
            mockTestId: nsat2024._id,
            section: 'Coding',
            questionNumber: 1,
            questionText: 'Write a function to find the Kth largest element in an array.',
            questionType: 'coding',
            isCoding: true,
            options: [],
            correctAnswer: 'N/A',
            marks: 50,
            difficulty: 'medium',
            subject: 'Coding',
            chapter: 'Arrays & Sorting',
            tags: ['Sorting', 'Heap'],
            codeTemplate: [
                { language: 'python', template: 'def findKthLargest(nums, k):\n    # Write your code here\n    pass' },
                { language: 'javascript', template: 'function findKthLargest(nums, k) {\n    // Write your code here\n}' }
            ],
            testCases: [
                { input: 'nums = [3,2,1,5,6,4], k = 2', expectedOutput: '5', isHidden: false },
                { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', expectedOutput: '4', isHidden: true }
            ]
        });


        console.log('Seed Data Inserted Successfully');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPYQs();
