import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MockTest from '../models/MockTest';
import Question from '../models/Question';
import fs from 'fs';
import path from 'path';

dotenv.config();

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
        }
    } catch (e) {
        console.error('Error loading env:', e);
    }
};

loadFrontendEnv();

const seedContent = async () => {
    try {
        let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart';

        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(uri);

        // --- NEET ---
        // Clean existing NEET mocks to avoid dupes if re-run (optional, or just create new)
        await MockTest.deleteMany({ examType: { $in: ['neet', 'ugee'] } });
        // We also should delete questions linked to these, but for simplicity I'll just leave them or delete all?
        // Let's rely on fresh seeding for these types.

        console.log('Seeding NEET Content...');
        const neetMock = await MockTest.create({
            title: 'NEET Full Syllabus Mock 1',
            slug: 'neet-full-mock-1',
            examType: 'neet',
            duration: 200, // 3h 20m
            totalMarks: 720,
            description: 'Full syllabus mock test for NEET 2026. Covers Physics, Chemistry, and Biology.',
            isFree: true,
            isPremium: false,
            sections: [
                { name: 'Physics', questionCount: 5, marks: 20 },
                { name: 'Chemistry', questionCount: 5, marks: 20 },
                { name: 'Biology', questionCount: 5, marks: 20 }
            ]
        });

        const neetQuestions = [
            {
                section: 'Biology',
                text: 'Which of the following is not a characteristic of phylum Chordata?',
                options: [{ id: 'a', text: 'Notochord' }, { id: 'b', text: 'Dorsal hollow nerve cord' }, { id: 'c', text: 'Paired pharyngeal gill slits' }, { id: 'd', text: 'Ventral heart absent' }],
                correct: 'd',
                expl: 'Chordates have a ventral heart.'
            },
            {
                section: 'Biology',
                text: 'The structural and functional unit of kidney is:',
                options: [{ id: 'a', text: 'Nephron' }, { id: 'b', text: 'Neuron' }, { id: 'c', text: 'Alveoli' }, { id: 'd', text: 'Villi' }],
                correct: 'a',
                expl: 'Nephron is the unit of kidney.'
            },
            {
                section: 'Physics',
                text: 'Dimensional formula for Universal Gravitational Constant (G) is:',
                options: [{ id: 'a', text: '[M-1 L3 T-2]' }, { id: 'b', text: '[M L2 T-2]' }, { id: 'c', text: '[M-2 L2 T-1]' }, { id: 'd', text: '[M-1 L2 T-2]' }],
                correct: 'a',
                expl: 'F = G m1 m2 / r^2 => G = F r^2 / m1 m2.'
            },
            {
                section: 'Chemistry',
                text: 'Which of the following has highest bond angle?',
                options: [{ id: 'a', text: 'CH4' }, { id: 'b', text: 'NH3' }, { id: 'c', text: 'H2O' }, { id: 'd', text: 'BF3' }],
                correct: 'd',
                expl: 'BF3 is planar (120 deg). CH4 (109.5), NH3 (107), H2O (104.5).'
            }
        ];

        for (const [i, q] of neetQuestions.entries()) {
            await Question.create({
                mockTestId: neetMock._id,
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

        // --- UGEE ---
        console.log('Seeding UGEE Content...');
        const ugeeMock = await MockTest.create({
            title: 'UGEE Sample Paper 2026',
            slug: 'ugee-sample-2026',
            examType: 'ugee',
            duration: 180,
            totalMarks: 100, // Normalized
            description: 'Sample paper for UGEE. Contains SUPR and REAP sections.',
            isFree: true,
            isPremium: false,
            sections: [
                { name: 'SUPR', questionCount: 2, marks: 50 },
                { name: 'REAP', questionCount: 2, marks: 50 }
            ]
        });

        const ugeeQuestions = [
            {
                section: 'SUPR',
                text: 'If f(x) = x^2, then f(f(x)) is:',
                options: [{ id: 'a', text: 'x^4' }, { id: 'b', text: 'x^2' }, { id: 'c', text: '2x^2' }, { id: 'd', text: 'x' }],
                correct: 'a',
                expl: '(x^2)^2 = x^4'
            },
            {
                section: 'REAP',
                text: 'Statement: "If it rains, the ground gets wet." It is not raining. Conclusion: The ground is not wet.',
                options: [{ id: 'a', text: 'Valid' }, { id: 'b', text: 'Invalid' }],
                correct: 'b',
                expl: 'Denying the antecedent fallacy. The ground could be wet from other causes.'
            }
        ];

        for (const [i, q] of ugeeQuestions.entries()) {
            await Question.create({
                mockTestId: ugeeMock._id,
                questionNumber: i + 1,
                section: q.section,
                questionText: q.text,
                questionType: 'mcq',
                options: q.options,
                correctAnswer: q.correct,
                marks: 1,
                negativeMarks: 0,
                difficulty: 'hard',
                explanation: q.expl
            });
        }

        console.log('Seeding Complete.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding content:', error);
        process.exit(1);
    }
};

seedContent();
