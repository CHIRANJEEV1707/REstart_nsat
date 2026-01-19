import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/Exam';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Load env from frontend/.env.local manually
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

const seedExams = async () => {
    try {
        let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restart';

        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        await Exam.deleteMany({});
        console.log('Cleared existing Exams');

        const exams = [
            {
                name: 'JEE Mains',
                code: 'jee-mains',
                description: 'Joint Entrance Examination Main for Admission to NITs, IIITs, and CFTIs.',
                dates: {
                    registration_start: new Date('2025-11-01'),
                    registration_end: new Date('2026-03-31'),
                    exam_date_start: new Date('2026-04-04'),
                    exam_date_end: new Date('2026-04-15')
                },
                eligibility: 'Class 12th Pass/Appearing with Physics, Chemistry, Maths',
                website: 'jeemain.nta.nic.in'
            },
            {
                name: 'JEE Advanced',
                code: 'jee-advanced',
                description: 'For admission to IITs. Requires qualifying JEE Mains.',
                dates: {
                    registration_start: new Date('2026-04-21'),
                    registration_end: new Date('2026-04-30'),
                    exam_date_start: new Date('2026-05-26'),
                    exam_date_end: new Date('2026-05-26')
                },
                eligibility: 'Top 2.5 Lakh rank in JEE Mains',
                website: 'jeeadv.ac.in'
            },
            {
                name: 'NEET UG',
                code: 'neet',
                description: 'National Eligibility cum Entrance Test for MBBS/BDS courses in India.',
                dates: {
                    registration_start: new Date('2026-02-09'),
                    registration_end: new Date('2026-03-09'),
                    exam_date_start: new Date('2026-05-05'),
                    exam_date_end: new Date('2026-05-05')
                },
                eligibility: 'Class 12th Pass/Appearing with Physics, Chemistry, Biology',
                website: 'neet.nta.nic.in'
            },
            {
                name: 'UGEE',
                code: 'ugee',
                description: 'Undergraduate Entrance Examination for Dual Degree programs at IIIT Hyderabad.',
                dates: {
                    registration_start: new Date('2026-02-06'),
                    registration_end: new Date('2026-04-01'),
                    exam_date_start: new Date('2026-05-04'),
                    exam_date_end: new Date('2026-05-04')
                },
                eligibility: 'Class 12th Pass/Appearing with PCM',
                website: 'ugadmissions.iiit.ac.in/ugee'
            },
            {
                name: 'BITSAT',
                code: 'bitsat',
                description: 'Birla Institute of Technology and Science Admission Test.',
                dates: {
                    registration_start: new Date('2026-01-14'),
                    registration_end: new Date('2026-04-11'),
                    exam_date_start: new Date('2026-05-20'),
                    exam_date_end: new Date('2026-06-24')
                },
                eligibility: 'Class 12th Pass with PCM',
                website: 'bitsadmission.com'
            },
            {
                name: 'NSAT',
                code: 'nsat',
                description: 'Newton School Aptitude Test.',
                dates: {
                    registration_start: new Date('2025-01-01'),
                    registration_end: new Date('2025-12-31'),
                    exam_date_start: new Date('2025-01-01'),
                    exam_date_end: new Date('2025-12-31')
                },
                eligibility: 'Any graduate/undergraduate',
                website: 'newtonschool.co'
            }
        ];

        await Exam.insertMany(exams);
        console.log('Seeded Exams');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding exams:', error);
        process.exit(1);
    }
};

seedExams();
