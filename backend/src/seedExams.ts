import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from './models/Exam';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1);
    }
};

const seedExams = async () => {
    try {
        await connectDB();

        // Read data from JSON file
        const jsonPath = path.join(__dirname, '../examList.json');

        if (!fs.existsSync(jsonPath)) {
            console.error(`❌ JSON file not found at: ${jsonPath}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const examData = JSON.parse(fileContent);

        console.log(`Read ${examData.length} exams from examList.json`);

        console.log("Clearing existing Exam data...");
        await Exam.deleteMany({});

        console.log(`Seeding ${examData.length} exams given to database...`);
        // Filter out __v if it exists, although mongoose usually handles it.
        const cleanedData = examData.map((exam: any) => {
            const { __v, ...rest } = exam;
            return rest;
        });

        await Exam.insertMany(cleanedData);

        console.log(`✅ Successfully seeded ${cleanedData.length} exams`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedExams();
