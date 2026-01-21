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

        console.log(`Connecting to MongoDB...`);

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Clear existing NSAT data
        await MockTest.deleteMany({});
        await Question.deleteMany({});
        await PYQCategory.deleteMany({});
        await PYQQuestion.deleteMany({});
        await InterviewGuide.deleteMany({});
        console.log('Cleared existing data');

        // ============================================================
        // NSAT GENERAL - 80 Questions, 180 Minutes
        // ============================================================
        const nsatGeneral = await MockTest.create({
            title: 'NSAT Full Mock Test 01',
            slug: 'nsat-full-mock-01',
            description: 'Complete NSAT mock test with 80 questions covering Mathematics, General Aptitude, and English. Identical to actual exam format.',
            examType: 'nsat',
            duration: 180,
            totalMarks: 320,
            passingMarks: 0,
            isFree: true,
            isPremium: false,
            isActive: true,
            difficulty: 'medium',
            order: 1,
            sections: [
                { name: 'Mathematics (Class 10)', questionCount: 15, marks: 60 },
                { name: 'Mathematics (Class 11-12)', questionCount: 15, marks: 60 },
                { name: 'Logic & Data Interpretation', questionCount: 20, marks: 80 },
                { name: 'Algorithmic Thinking', questionCount: 10, marks: 40 },
                { name: 'Reading Comprehension', questionCount: 10, marks: 40 },
                { name: 'Language Reasoning', questionCount: 10, marks: 40 }
            ],
            instructions: [
                'Total duration: 180 minutes for 80 questions',
                'Marking: +4 for correct, -1 for incorrect',
                'All questions are MCQs with single correct answer',
                'You can navigate between questions within any section',
                'Test is proctored via webcam and microphone'
            ]
        });

        // --- Mathematics Class 10 Questions (15) ---
        const mathClass10Questions = [
            {
                questionNumber: 1,
                section: 'Mathematics (Class 10)',
                questionText: 'Cinderella bought 63 Disney shares at a price of $12.49 per share and sold them at $100.07 per share after 7 years. She pays a 1.3 percent transaction charge on both purchase & sale of shares. Which of the below options most accurately describes her overall return on investment?',
                options: [
                    { id: 'a', text: '900%' },
                    { id: 'b', text: '700%' },
                    { id: 'c', text: '500%' },
                    { id: 'd', text: '300%' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'Purchase = 63 × 12.49 = 786.87, Sale = 63 × 100.07 = 6304.41. After 1.3% charges on both: Net gain ≈ 700% return.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            },
            {
                questionNumber: 2,
                section: 'Mathematics (Class 10)',
                questionText: 'Gaurav is travelling from Mumbai to Pune on a bullet train. Statement 1: His average speed was higher than 55 m/s. Statement 2: His average speed was lower than 65 m/s. Is his average speed less than 200 km/hr?',
                options: [
                    { id: 'a', text: 'Each statement is independently sufficient' },
                    { id: 'b', text: 'Both statements together are sufficient, but neither alone' },
                    { id: 'c', text: 'Both statements together are not sufficient' },
                    { id: 'd', text: 'Statement 1 alone is sufficient' },
                    { id: 'e', text: 'Statement 2 alone is sufficient' }
                ],
                correctAnswer: 'e',
                explanation: '200 km/hr = 55.56 m/s. Statement 2 says speed < 65 m/s, which doesn\'t guarantee < 55.56. Statement 1 says > 55, so could be above 55.56. Need Statement 2 to confirm < 65 m/s.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            },
            {
                questionNumber: 3,
                section: 'Mathematics (Class 10)',
                questionText: 'Find the HCF of 120 and 156.',
                options: [
                    { id: 'a', text: '12' },
                    { id: 'b', text: '6' },
                    { id: 'c', text: '24' },
                    { id: 'd', text: '36' }
                ],
                correctAnswer: 'a',
                explanation: '120 = 2³ × 3 × 5, 156 = 2² × 3 × 13. HCF = 2² × 3 = 12',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            },
            {
                questionNumber: 4,
                section: 'Mathematics (Class 10)',
                questionText: 'A shopkeeper marks an item 40% above cost price and offers 20% discount. What is his profit percentage?',
                options: [
                    { id: 'a', text: '20%' },
                    { id: 'b', text: '12%' },
                    { id: 'c', text: '8%' },
                    { id: 'd', text: '16%' }
                ],
                correctAnswer: 'b',
                explanation: 'Let CP = 100. MP = 140. SP = 140 × 0.8 = 112. Profit = 12%',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            },
            {
                questionNumber: 5,
                section: 'Mathematics (Class 10)',
                questionText: 'A train 150m long passes a pole in 15 seconds. Find its speed in km/hr.',
                options: [
                    { id: 'a', text: '36 km/hr' },
                    { id: 'b', text: '40 km/hr' },
                    { id: 'c', text: '45 km/hr' },
                    { id: 'd', text: '50 km/hr' }
                ],
                correctAnswer: 'a',
                explanation: 'Speed = 150/15 = 10 m/s = 10 × (18/5) = 36 km/hr',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            }
        ];

        // Add more Class 10 questions (6-15)
        for (let i = 6; i <= 15; i++) {
            mathClass10Questions.push({
                questionNumber: i,
                section: 'Mathematics (Class 10)',
                questionText: `Class 10 Mathematics Question ${i} - [Sample question covering Number System, Arithmetic, Algebra, or Applied Mathematics]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Mathematics Class 11-12 Questions (15) ---
        const mathClass1112Questions = [
            {
                questionNumber: 16,
                section: 'Mathematics (Class 11-12)',
                questionText: 'A bag contains 5 red, 4 blue and 3 green balls. Two balls are drawn at random. What is the probability that they are of different colours?',
                options: [
                    { id: 'a', text: '65%' },
                    { id: 'b', text: '67%' },
                    { id: 'c', text: '69%' },
                    { id: 'd', text: '71%' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'd',
                explanation: 'Total ways = C(12,2) = 66. Same color = C(5,2) + C(4,2) + C(3,2) = 10 + 6 + 3 = 19. Different = 66 - 19 = 47. P = 47/66 ≈ 71%',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            },
            {
                questionNumber: 17,
                section: 'Mathematics (Class 11-12)',
                questionText: 'Evaluate the integral of f(x) = (x-7)/(x+7)⁷',
                options: [
                    { id: 'a', text: '1/(6(x+7)⁶) + C' },
                    { id: 'b', text: '(1/5)(x+7)⁻⁵ - (7/6)(x+7)⁻⁶ + C' },
                    { id: 'c', text: '(3/7)(x+7)⁻⁶ - (x+7)⁻⁵ + C' },
                    { id: 'd', text: '(1/5)(x+7)⁻⁵ + (7/5)(x+7)⁻⁶ + C' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'Using substitution and integration by parts.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            },
            {
                questionNumber: 18,
                section: 'Mathematics (Class 11-12)',
                questionText: 'If A = {1, 2, 3} and B = {2, 3, 4}, find n(A ∪ B).',
                options: [
                    { id: 'a', text: '3' },
                    { id: 'b', text: '4' },
                    { id: 'c', text: '5' },
                    { id: 'd', text: '6' }
                ],
                correctAnswer: 'b',
                explanation: 'A ∪ B = {1, 2, 3, 4}, so n(A ∪ B) = 4',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            }
        ];

        // Add more Class 11-12 questions (19-30)
        for (let i = 19; i <= 30; i++) {
            mathClass1112Questions.push({
                questionNumber: i,
                section: 'Mathematics (Class 11-12)',
                questionText: `Class 11-12 Mathematics Question ${i} - [Sample question covering Sets, PnC, Series, Calculus, Matrices, or Probability]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Logic & Data Interpretation Questions (20) ---
        const logicQuestions = [
            {
                questionNumber: 31,
                section: 'Logic & Data Interpretation',
                questionText: 'Vishwa, Harleen, Aniket, Rutvik, Vaibhavi & Nishant are studying in Library. Based on hints: 1) Three people love Pizza. 2) Vaibhavi & Nishant either love or hate Biryani. 3) Only one member hates Pasta. 4) Vishwa hints about pizza and burger. 5) Nishant loves paratha, Rutvik hates pizza. 6) Aniket & Vaibhavi hate Paratha. What does Vishwa love?',
                options: [
                    { id: 'a', text: 'Burger' },
                    { id: 'b', text: 'Pizza' },
                    { id: 'c', text: 'Pasta' },
                    { id: 'd', text: 'Biryani' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'Following the logic constraints, Vishwa loves Pizza.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            },
            {
                questionNumber: 32,
                section: 'Logic & Data Interpretation',
                questionText: 'Based on the same puzzle: For which member are you unable to determine their loved food item?',
                options: [
                    { id: 'a', text: 'Vishwa' },
                    { id: 'b', text: 'Harleen' },
                    { id: 'c', text: 'Aniket' },
                    { id: 'd', text: 'Rutvik' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'Harleen\'s preference cannot be uniquely determined.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            }
        ];

        // Add more Logic questions (33-50)
        for (let i = 33; i <= 50; i++) {
            logicQuestions.push({
                questionNumber: i,
                section: 'Logic & Data Interpretation',
                questionText: `Logic & DI Question ${i} - [Sample question covering Tables, Graphs, Venn Diagrams, Arrangements, Directions, or Relations]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Algorithmic Thinking Questions (10) ---
        const algoThinkingQuestions = [
            {
                questionNumber: 51,
                section: 'Algorithmic Thinking',
                questionText: 'SpaceX rover mission: Rover at Start facing X. If X is Ammonia lake, which instruction set gets rover from Start to End? Options show different Turn/Move sequences.',
                options: [
                    { id: 'a', text: 'Turn right, Move×2, Turn left, Move×5, Turn right, Move×2' },
                    { id: 'b', text: 'Turn right, Move×4, Turn left, Move×5' },
                    { id: 'c', text: 'Turn right, Move×3, Turn left, Move×4, Turn right, Move×2' },
                    { id: 'd', text: 'Turn right, Move×2, Turn left, Move×4, Turn right, Move×3' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'd',
                explanation: 'Following the grid and avoiding the Ammonia lake at X.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            },
            {
                questionNumber: 52,
                section: 'Algorithmic Thinking',
                questionText: 'Rover lands at (1,6) facing Ammonia lake. Each instruction takes 15 minutes to transmit. What is minimum time to reach End?',
                options: [
                    { id: 'a', text: '150 Minutes' },
                    { id: 'b', text: '135 Minutes' },
                    { id: 'c', text: '120 Minutes' },
                    { id: 'd', text: '75 Minutes' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'c',
                explanation: 'Minimum 8 instructions needed × 15 minutes = 120 minutes.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            }
        ];

        // Add more Algorithmic questions (53-60)
        for (let i = 53; i <= 60; i++) {
            algoThinkingQuestions.push({
                questionNumber: i,
                section: 'Algorithmic Thinking',
                questionText: `Algorithmic Thinking Question ${i} - [Sample question on instruction sequences, pattern prediction, computational thinking]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Reading Comprehension Questions (10) ---
        const readingQuestions = [
            {
                questionNumber: 61,
                section: 'Reading Comprehension',
                questionText: 'Passage about disgust and fermented foods (Casu marzu, kimchi, etc.): Which food is known as "rotten cheese" or "maggot-ridden cheese"?',
                options: [
                    { id: 'a', text: 'Kimchee' },
                    { id: 'b', text: 'Gravlax' },
                    { id: 'c', text: 'Chorizo' },
                    { id: 'd', text: 'Casu marzu' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'd',
                explanation: 'Casu marzu is the Sardinian sheep cheese with maggots.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            },
            {
                questionNumber: 62,
                section: 'Reading Comprehension',
                questionText: 'What is the purpose of the emotion of disgust, according to Rachel Herz?',
                options: [
                    { id: 'a', text: 'To make us avoid toxic food' },
                    { id: 'b', text: 'To enhance our cultural values' },
                    { id: 'c', text: 'To trigger fear responses' },
                    { id: 'd', text: 'To create joy and surprise' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'a',
                explanation: 'Herz states disgust helps us avoid rotted and toxic food.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            }
        ];

        // Add more Reading questions (63-70)
        for (let i = 63; i <= 70; i++) {
            readingQuestions.push({
                questionNumber: i,
                section: 'Reading Comprehension',
                questionText: `Reading Comprehension Question ${i} - [Passage-based question on summary, tone, arguments, cause & effect]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Language Reasoning Questions (10) ---
        const languageQuestions = [
            {
                questionNumber: 71,
                section: 'Language Reasoning',
                questionText: 'Arrange sentences about Dutch East India Company (VOC) in coherent order: 1) It was one of world\'s first multinationals... 2) However, factors like corruption... 3) The Dutch East India Company was established in 1602... 4) This multinational engaged in spice trading...',
                options: [
                    { id: 'a', text: '1342' },
                    { id: 'b', text: '3142' },
                    { id: 'c', text: '4213' },
                    { id: 'd', text: '1234' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'Logical order: Introduction (3), description (1), activities (4), conclusion (2).',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            },
            {
                questionNumber: 72,
                section: 'Language Reasoning',
                questionText: 'Based on nuclear energy passage arguing for nuclear as low-carbon with safety measures - what belief would the author likely hold?',
                options: [
                    { id: 'a', text: 'Trust in stringent safety measures and regulations' },
                    { id: 'b', text: 'Disbelief in nuclear potential due to research gaps' },
                    { id: 'c', text: 'Fear of long-term nuclear waste effects' },
                    { id: 'd', text: 'Promote nuclear regardless of safety laws' },
                    { id: 'e', text: 'None of the above' }
                ],
                correctAnswer: 'a',
                explanation: 'The author emphasizes trust in safety measures throughout.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            }
        ];

        // Add more Language questions (73-80)
        for (let i = 73; i <= 80; i++) {
            languageQuestions.push({
                questionNumber: i,
                section: 'Language Reasoning',
                questionText: `Language Reasoning Question ${i} - [Sample question on sentence arrangement, author inference, error identification]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // Insert all NSAT General questions
        const allNsatGeneralQuestions = [
            ...mathClass10Questions,
            ...mathClass1112Questions,
            ...logicQuestions,
            ...algoThinkingQuestions,
            ...readingQuestions,
            ...languageQuestions
        ];

        for (const q of allNsatGeneralQuestions) {
            await Question.create({
                mockTestId: nsatGeneral._id,
                ...q,
                questionType: 'mcq'
            });
        }

        console.log(`Seeded NSAT General with ${allNsatGeneralQuestions.length} questions`);

        // ============================================================
        // NSAT CODING - 26 Questions, 180 Minutes
        // ============================================================
        const nsatCoding = await MockTest.create({
            title: 'NSAT Coding Full Mock Test 01',
            slug: 'nsat-coding-full-mock-01',
            description: 'Complete NSAT Coding mock test with 26 questions covering Learnability, Pseudocoding, and Coding. Identical to actual exam format.',
            examType: 'coding-nsat',
            duration: 180,
            totalMarks: 280,
            passingMarks: 0,
            isFree: true,
            isPremium: false,
            isActive: true,
            difficulty: 'medium',
            order: 1,
            sections: [
                { name: 'Learnability', questionCount: 10, marks: 40 },
                { name: 'Pseudocoding', questionCount: 10, marks: 40 },
                { name: 'Coding', questionCount: 6, marks: 200 }
            ],
            instructions: [
                'Total duration: 180 minutes for 26 questions',
                'Sections: Learnability (10 MCQ), Pseudocoding (10 MCQ), Coding (6)',
                'MCQ Marking: +4 for correct, -1 for incorrect',
                'Coding: Marks based on test cases passed',
                'You can answer coding questions in any language',
                'Test is proctored via webcam and microphone'
            ]
        });

        // --- Learnability Questions (10) - Passage-based analytical ---
        const learnabilityQuestions = [
            {
                questionNumber: 1,
                section: 'Learnability',
                questionText: `Alien Travel and Wormholes: In an alternate universe, a galaxy has 3 stars represented by plane equations (ax+by+cz=d). A wormhole exists if the God Formula g(f) = det(coefficients) ≠ 0.

Galaxy System 1: x+y+z=6, 2x−y+3z=14, 3x+2y+z=10
Galaxy System 2: x+y+z=5, 2x+2y+2z=10, 3x+3y+3z=15

Will an alien be able to travel using a wormhole in these systems? If wormhole exists, find coordinates.`,
                options: [
                    { id: 'a', text: 'System 1: No wormhole, System 2: (2/7, 5/7, 3/7)' },
                    { id: 'b', text: 'System 1: (12/7, 4/7, 26/7), System 2: (2/7, 5/7, 3/7)' },
                    { id: 'c', text: 'System 1: (12/7, 4/7, 26/7), System 2: No wormhole' },
                    { id: 'd', text: 'System 1: No wormhole, System 2: (12/7, 4/7, 3/7)' }
                ],
                correctAnswer: 'c',
                explanation: 'System 1 has det ≠ 0 so wormhole exists at (12/7, 4/7, 26/7). System 2 has det = 0 (parallel planes) so no wormhole.',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            },
            {
                questionNumber: 2,
                section: 'Learnability',
                questionText: `Cannon Fireball: A cannon achieves max horizontal range of 25.6m from ground. Firing formula for max range from height h: tan(2θ) = 2u²/(gh). Given g=10 m/s². What is the initial velocity?`,
                options: [
                    { id: 'a', text: '12 m/s' },
                    { id: 'b', text: '14 m/s' },
                    { id: 'c', text: '16 m/s' },
                    { id: 'd', text: '18 m/s' }
                ],
                correctAnswer: 'c',
                explanation: 'Max range from ground = u²/g = 25.6. So u² = 256, u = 16 m/s',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            },
            {
                questionNumber: 3,
                section: 'Learnability',
                questionText: `Same cannon fired from 30m tower with u=16 m/s. Given tan⁻¹(1.7067)=60°. What is maximum horizontal range from tower?`,
                options: [
                    { id: 'a', text: '35.4 m' },
                    { id: 'b', text: '40.2 m' },
                    { id: 'c', text: '45.6 m' },
                    { id: 'd', text: '47.0 m' }
                ],
                correctAnswer: 'd',
                explanation: 'Using the formula with height factor, range ≈ 47.0 m',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'hard'
            }
        ];

        // Add more Learnability questions (4-10)
        for (let i = 4; i <= 10; i++) {
            learnabilityQuestions.push({
                questionNumber: i,
                section: 'Learnability',
                questionText: `Learnability Question ${i} - [Passage-based analytical/mathematical comprehension question]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Pseudocoding Questions (10) ---
        const pseudocodingQuestions = [
            {
                questionNumber: 11,
                section: 'Pseudocoding',
                questionText: `What will be the output of the following pseudocode?
x = 5
y = 10
x = x + y
y = x - y
x = x - y
print x, y`,
                options: [
                    { id: 'a', text: '5, 10' },
                    { id: 'b', text: '10, 5' },
                    { id: 'c', text: '0, 15' },
                    { id: 'd', text: '15, 0' }
                ],
                correctAnswer: 'b',
                explanation: 'This is the swap algorithm without temp. x=15, y=15-10=5, x=15-5=10. Output: 10, 5',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            },
            {
                questionNumber: 12,
                section: 'Pseudocoding',
                questionText: `What is the purpose of the following pseudocode?
n = 7
a = 1
for i = 1 to n
    a = a * i
print a`,
                options: [
                    { id: 'a', text: 'Prints the sum of numbers from 1 to 7' },
                    { id: 'b', text: 'Prints the factorial of 7' },
                    { id: 'c', text: 'Prints the product of even numbers up to 7' },
                    { id: 'd', text: 'None of the above' }
                ],
                correctAnswer: 'b',
                explanation: 'The loop multiplies 1×2×3×4×5×6×7 = 7! (factorial)',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'easy'
            },
            {
                questionNumber: 13,
                section: 'Pseudocoding',
                questionText: `What will be output for a) t=0, b) t=1?
a = 2
for i = t to 2
    a = a * a * i`,
                options: [
                    { id: 'a', text: 'a) 2, b) 16' },
                    { id: 'b', text: 'a) Error, b) 32' },
                    { id: 'c', text: 'a) 0, b) 32' },
                    { id: 'd', text: 'a) 2, b) Error' }
                ],
                correctAnswer: 'c',
                explanation: 'For t=0: a=2, i=0: a=2*2*0=0, i=1: a=0*0*1=0, i=2: a=0. For t=1: a=2, i=1: a=4, i=2: a=32',
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            }
        ];

        // Add more Pseudocoding questions (14-20)
        for (let i = 14; i <= 20; i++) {
            pseudocodingQuestions.push({
                questionNumber: i,
                section: 'Pseudocoding',
                questionText: `Pseudocoding Question ${i} - [Code output prediction or debugging question]`,
                options: [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' }
                ],
                correctAnswer: 'a',
                explanation: 'Explanation for question ' + i,
                marks: 4,
                negativeMarks: 1,
                difficulty: 'medium'
            });
        }

        // --- Coding Questions (6) ---
        const codingQuestions = [
            {
                questionNumber: 21,
                section: 'Coding',
                questionText: `Write a function that takes an integer n as input and returns true if n is a prime number, false otherwise.

A prime number is a number which is divisible only by 1 and itself.

Function signature: isPrime(n: int) -> bool`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Check divisibility from 2 to sqrt(n). Time complexity O(sqrt(n)).',
                marks: 30,
                negativeMarks: 0,
                difficulty: 'easy',
                codeTemplate: [
                    { language: 'python', template: 'def isPrime(n):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'bool isPrime(int n) {\n    // Write your code here\n    return false;\n}' },
                    { language: 'java', template: 'public boolean isPrime(int n) {\n    // Write your code here\n    return false;\n}' }
                ],
                testCases: [
                    { input: '7', expectedOutput: 'true', isHidden: false },
                    { input: '10', expectedOutput: 'false', isHidden: false },
                    { input: '1', expectedOutput: 'false', isHidden: true },
                    { input: '2', expectedOutput: 'true', isHidden: true }
                ]
            },
            {
                questionNumber: 22,
                section: 'Coding',
                questionText: `Write a function that takes an array of integers and its size as input and returns the second largest element in the array.

If there is no second largest element (all elements same), return -1.

Function signature: secondLargest(arr: int[], size: int) -> int`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Track largest and second largest in single pass. O(n) time.',
                marks: 35,
                negativeMarks: 0,
                difficulty: 'medium',
                codeTemplate: [
                    { language: 'python', template: 'def secondLargest(arr, size):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'int secondLargest(int arr[], int size) {\n    // Write your code here\n    return -1;\n}' },
                    { language: 'java', template: 'public int secondLargest(int[] arr, int size) {\n    // Write your code here\n    return -1;\n}' }
                ],
                testCases: [
                    { input: '[5, 2, 8, 1, 9], 5', expectedOutput: '8', isHidden: false },
                    { input: '[3, 3, 3], 3', expectedOutput: '-1', isHidden: false },
                    { input: '[1, 2], 2', expectedOutput: '1', isHidden: true }
                ]
            },
            {
                questionNumber: 23,
                section: 'Coding',
                questionText: `Write a function that takes a string s representing a sentence and returns the longest word in the sentence.

If there are multiple words with the same maximum length, return the first occurring longest word.

Function signature: longestWord(s: string) -> string`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Split by spaces and track longest word. O(n) time.',
                marks: 35,
                negativeMarks: 0,
                difficulty: 'medium',
                codeTemplate: [
                    { language: 'python', template: 'def longestWord(s):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'string longestWord(string s) {\n    // Write your code here\n    return "";\n}' },
                    { language: 'java', template: 'public String longestWord(String s) {\n    // Write your code here\n    return "";\n}' }
                ],
                testCases: [
                    { input: 'The quick brown fox', expectedOutput: 'quick', isHidden: false },
                    { input: 'Hello World', expectedOutput: 'Hello', isHidden: false },
                    { input: 'Programming is fun', expectedOutput: 'Programming', isHidden: true }
                ]
            },
            {
                questionNumber: 24,
                section: 'Coding',
                questionText: `Write a function to reverse an array in-place.

Function signature: reverseArray(arr: int[], size: int) -> void`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Swap elements from both ends moving towards center.',
                marks: 30,
                negativeMarks: 0,
                difficulty: 'easy',
                codeTemplate: [
                    { language: 'python', template: 'def reverseArray(arr):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'void reverseArray(int arr[], int size) {\n    // Write your code here\n}' }
                ],
                testCases: [
                    { input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]', isHidden: false },
                    { input: '[1]', expectedOutput: '[1]', isHidden: true }
                ]
            },
            {
                questionNumber: 25,
                section: 'Coding',
                questionText: `Write a function to find the sum of all even numbers in an array.

Function signature: sumOfEvens(arr: int[], size: int) -> int`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Iterate and sum elements divisible by 2.',
                marks: 30,
                negativeMarks: 0,
                difficulty: 'easy',
                codeTemplate: [
                    { language: 'python', template: 'def sumOfEvens(arr):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'int sumOfEvens(int arr[], int size) {\n    // Write your code here\n    return 0;\n}' }
                ],
                testCases: [
                    { input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12', isHidden: false },
                    { input: '[1, 3, 5]', expectedOutput: '0', isHidden: true }
                ]
            },
            {
                questionNumber: 26,
                section: 'Coding',
                questionText: `Write a function to check if a string is a palindrome (reads same forwards and backwards, ignoring case).

Function signature: isPalindrome(s: string) -> bool`,
                questionType: 'coding',
                isCoding: true,
                options: [],
                correctAnswer: 'N/A',
                explanation: 'Compare characters from both ends or reverse and compare.',
                marks: 40,
                negativeMarks: 0,
                difficulty: 'medium',
                codeTemplate: [
                    { language: 'python', template: 'def isPalindrome(s):\n    # Write your code here\n    pass' },
                    { language: 'cpp', template: 'bool isPalindrome(string s) {\n    // Write your code here\n    return false;\n}' }
                ],
                testCases: [
                    { input: 'Madam', expectedOutput: 'true', isHidden: false },
                    { input: 'hello', expectedOutput: 'false', isHidden: false },
                    { input: 'RaceCar', expectedOutput: 'true', isHidden: true }
                ]
            }
        ];

        // Insert Learnability and Pseudocoding questions
        for (const q of [...learnabilityQuestions, ...pseudocodingQuestions]) {
            await Question.create({
                mockTestId: nsatCoding._id,
                ...q,
                questionType: 'mcq'
            });
        }

        // Insert Coding questions
        for (const q of codingQuestions) {
            await Question.create({
                mockTestId: nsatCoding._id,
                ...q
            });
        }

        console.log(`Seeded NSAT Coding with ${learnabilityQuestions.length + pseudocodingQuestions.length + codingQuestions.length} questions`);

        // ============================================================
        // Interview Guides
        // ============================================================
        await InterviewGuide.create({
            title: 'NSAT General Preparation Guide',
            slug: 'nsat-general-guide',
            guideType: 'nsat',
            description: 'Complete preparation guide for NSAT General covering Mathematics, Aptitude, and English.',
            content: `# NSAT General Preparation Guide

## Exam Overview
- Duration: 180 minutes
- Questions: 80 MCQs
- Marking: +4/-1

## Sections

### Mathematics (30 Questions)
**Class 10 Topics:**
- Number System (LCM, HCF, Divisibility)
- Arithmetic (Ratios, Percentages, Averages)
- Algebra (Polynomials, Linear Equations)
- Applied Math (Speed, Profit & Loss, Interest)

**Class 11-12 Topics:**
- Sets, Functions, PnC
- Sequences & Series
- Differentiation & Integration
- Matrices & Determinants
- Probability & Statistics

### General Aptitude (30 Questions)
- Data Interpretation (Tables, Graphs, Venn Diagrams)
- Logical Reasoning (Arrangements, Directions, Relations)
- Algorithmic Thinking (Instruction sequences, Pattern prediction)

### English (20 Questions)
- Reading Comprehension (Summary, Tone, Arguments)
- Language Reasoning (Sentence arrangement, Error identification)`,
            isFree: true,
            isActive: true,
            tips: [
                'Focus on Class 10 math fundamentals',
                'Practice data interpretation daily',
                'Read news articles for comprehension practice'
            ],
            sampleQuestions: []
        });

        await InterviewGuide.create({
            title: 'NSAT Coding Preparation Guide',
            slug: 'nsat-coding-guide',
            guideType: 'coding',
            description: 'Complete preparation guide for NSAT Coding covering Learnability, Pseudocoding, and Coding.',
            content: `# NSAT Coding Preparation Guide

## Exam Overview
- Duration: 180 minutes
- Questions: 26 (20 MCQ + 6 Coding)
- Marking: +4/-1 for MCQ, Test cases for Coding

## Sections

### Learnability (10 MCQs)
Passage-based analytical questions testing:
- Mathematical reasoning
- Physics concepts applied to scenarios
- Logical analysis of complex problems

### Pseudocoding (10 MCQs)
- Code output prediction
- Debugging and error finding
- Understanding control flow

### Coding (6 Questions)
- Basic Functions Building (2)
- Loops, Strings, Arrays (2)
- Algorithm Building (2)

## Topics to Cover
- Input/Output handling
- If-Else statements
- Loops (for, while)
- Arrays and Strings
- Functions
- Basic algorithms (sorting, searching)`,
            isFree: true,
            isActive: true,
            tips: [
                'Practice pseudocode tracing',
                'Solve basic coding problems daily',
                'Focus on time complexity understanding'
            ],
            sampleQuestions: []
        });

        console.log('Seeded Interview Guides');

        console.log('\\n✅ Database seeding completed successfully!');
        console.log(`   - NSAT General: ${allNsatGeneralQuestions.length} questions`);
        console.log(`   - NSAT Coding: ${learnabilityQuestions.length + pseudocodingQuestions.length + codingQuestions.length} questions`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
