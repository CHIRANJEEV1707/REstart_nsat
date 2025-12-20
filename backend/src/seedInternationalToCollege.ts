
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './models/College';
import fs from 'fs';
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../internationalCollege.json');

const studyAbroadDefaults: { [key: string]: any } = {
    "USA": {
        visa_requirements: ["F1 Student Visa", "I-20 Form", "SEVIS Fee Payment"],
        english_proficiency: ["TOEFL iBT: 100+", "IELTS: 7.5+"],
        scholarships_available: ["Need-based Financial Aid", "Merit Scholarships", "Fulbright"]
    },
    "UK": {
        visa_requirements: ["Student Visa (Tier 4)", "CAS Number", "TB Test"],
        english_proficiency: ["IELTS: 6.5-7.5", "PTE Academic"],
        scholarships_available: ["Chevening", "Commonwealth", "University Bursaries"]
    },
    "Canada": {
        visa_requirements: ["Study Permit", "Provincial Attestation Letter (PAL)", "Biometrics"],
        english_proficiency: ["IELTS: 6.5+", "TOEFL: 90+"],
        scholarships_available: ["Entrance Scholarships", "Vanier CGS"]
    },
    "Australia": {
        visa_requirements: ["Student Visa (Subclass 500)", "OSHC Insurance"],
        english_proficiency: ["IELTS: 6.5+", "PTE: 58+"],
        scholarships_available: ["Australia Awards", "Destination Australia"]
    },
    "Germany": {
        visa_requirements: ["Student Visa", "Blocked Account (Sperrkonto)", "Health Insurance"],
        english_proficiency: ["IELTS: 6.5", "TOEFL: 90", "German B1/B2 (for some)"],
        scholarships_available: ["DAAD", "Deutschlandstipendium"]
    },
    "Ireland": {
        visa_requirements: ["Student Visa (Class C)", "Medical Insurance"],
        english_proficiency: ["IELTS: 6.5", "TOEFL: 90"],
        scholarships_available: ["Government of Ireland", "University Scholarships"]
    },
    "New Zealand": {
        visa_requirements: ["Fee Paying Student Visa", "Medical Certificate"],
        english_proficiency: ["IELTS: 6.0+", "PTE"],
        scholarships_available: ["Manaaki New Zealand", "University Excellence"]
    },
    "Singapore": {
        visa_requirements: ["Student Pass", "IPA Letter"],
        english_proficiency: ["IELTS: 6.5", "TOEFL: 90"],
        scholarships_available: ["MOE Tuition Grant", "ASEAN Scholarship"]
    }
    // Add generic default for others
};

const genericDefault = {
    visa_requirements: ["Student Visa", "Valid Passport", "Proof of Funds"],
    english_proficiency: ["IELTS: 6.5", "TOEFL: 90"],
    scholarships_available: ["Merit-based Scholarships", "International Student Grants"]
};

const seedInternationalToCollege = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("✅ MongoDB Connected");

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const colleges = JSON.parse(rawData);

        console.log(`Found ${colleges.length} colleges in JSON.`);

        // Transform data
        const transformedData = colleges.map((college: any) => {

            const studyInfo = studyAbroadDefaults[college.country] || genericDefault;

            let type = college.type;
            const validTypes = ['Public', 'Private', 'IIIT', 'GFTI', 'Public Research University', 'Public Research Institute', 'Public Deemed University', 'Private Deemed University', 'Deemed University', 'Central University', 'Institute of National Importance', 'State University', 'University Department', 'Central Institute', 'State-Aided Autonomous', 'State University Campus', 'State Government College', 'State Government Aided', 'Private Autonomous', 'Private University'];

            if (!validTypes.includes(type)) {
                if (type.toLowerCase().includes('public')) type = 'Public';
                else if (type.toLowerCase().includes('private')) type = 'Private';
                else type = 'Public'; // fallback
            }

            return {
                ...college,
                type: type,
                // Ensure required fields for College schema
                admission_process: [
                    "Submit Application",
                    "Send Transcripts",
                    "English Proficiency Test",
                    "Statement of Purpose",
                    "Letters of Recommendation",
                    "Visa Interview"
                ],
                study_abroad_info: studyInfo
            };
        });

        console.log("Removing existing international colleges from College collection...");
        await College.deleteMany({ country: { $ne: "India" } });

        console.log(`Seeding ${transformedData.length} colleges into College collection...`);
        await College.insertMany(transformedData);

        console.log("✅ Seed complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error seeding:", err);
        process.exit(1);
    }
};

seedInternationalToCollege();
