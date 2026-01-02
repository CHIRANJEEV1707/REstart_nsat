import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Bundle from './models/Bundle';

dotenv.config();

const bundles = [
    {
        title: 'JEE Mains Complete Prep',
        slug: 'jee-mains-complete',
        description: 'Comprehensive preparation for JEE Mains with full syllabus coverage, mock tests, and doubt solving.',
        exam: 'JEE Mains',
        tags: ['Physics', 'Chemistry', 'Maths', 'Mock Tests'],
        features: [
            '200+ Video Lectures',
            '50+ Mock Tests',
            '24/7 Doubt Support',
            'Performance Analytics'
        ],
        price: 4999,
        currency: 'INR',
        validityDays: 365,
        isActive: true,
    },
    {
        title: 'BITSAT Speed Booster',
        slug: 'bitsat-speed-booster',
        description: 'Crash course designed to improve your speed and accuracy for BITSAT.',
        exam: 'BITSAT',
        tags: ['Crash Course', 'Speed Training', 'English & LR'],
        features: [
            'Timed Practice Sessions',
            'English & Logic Reasoning Module',
            '10 Full-length BITSAT Mocks',
            'Shortcut Tricks Workshop'
        ],
        price: 2499,
        currency: 'INR',
        validityDays: 180,
        isActive: true,
    },
    {
        title: 'MHT-CET Math Mastery',
        slug: 'mht-cet-math',
        description: 'Specialized course for mastering Mathematics for MHT-CET.',
        exam: 'MHT-CET',
        tags: ['Maths', 'State Level'],
        features: [
            'Chapter-wise PYQs',
            'Formula Sheets',
            'Weekly Live Classes',
            'Topic-wise Tests'
        ],
        price: 1499,
        currency: 'INR',
        validityDays: 120,
        isActive: true,
    },
    // NSAT Bundles (Separate Tiers)
    {
        title: 'NSAT Complete Prep – Basic',
        slug: 'nsat-complete-basic',
        description: 'Core preparation for NSAT including all concept video lectures.',
        exam: 'NSAT',
        tags: ['NSAT', 'Concept Videos'],
        features: [
            'Concept Video Lectures',
            'Syllabus Coverage',
            'Practice Questions',
            'Doubt Support'
        ],
        price: 300,
        currency: 'INR',
        validityDays: 365,
        isActive: true,
    },
    {
        title: 'NSAT Complete Prep – Interview',
        slug: 'nsat-complete-interview',
        description: 'Includes everything in Basic plus exclusive interview preparation modules.',
        exam: 'NSAT',
        tags: ['NSAT', 'Interview Prep'],
        features: [
            'All Basic Features',
            'Exclusive Interview Prep',
            'Mock Interviews',
            'Personality Development'
        ],
        price: 500,
        currency: 'INR',
        validityDays: 365,
        isActive: true,
    },
    {
        title: 'NSAT Complete Prep – Interview + Mocks',
        slug: 'nsat-complete-interview-mock',
        description: 'The ultimate package: Basic prep, Interview prep, and full-length Mock Tests.',
        exam: 'NSAT',
        tags: ['NSAT', 'Interview Prep', 'Mock Tests'],
        features: [
            'All Interview Features',
            '10 Full-length Mock Tests',
            'Detailed Performance Analysis',
            'Personalized Feedback'
        ],
        price: 800,
        currency: 'INR',
        validityDays: 365,
        isActive: true,
    }
];

const seedBundles = async () => {
    try {
        await connectDB();

        await Bundle.deleteMany({}); // Clear existing bundles
        console.log('Cleared existing bundles');

        await Bundle.insertMany(bundles);
        console.log('Added sample bundles');

        process.exit();
    } catch (error) {
        console.error('Error seeding bundles:', error);
        process.exit(1);
    }
};

seedBundles();
