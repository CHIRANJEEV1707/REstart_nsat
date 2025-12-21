"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const College_1 = __importDefault(require("../models/College"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const internationalColleges = [
    {
        name: "Massachusetts Institute of Technology (MIT)",
        location: { state: "Massachusetts", city: "Cambridge" },
        type: "Private",
        fees: 4500000, // ~ $55k
        exams_required: ["SAT", "TOEFL"],
        restart_score: 9.8,
        badges: ["#1 World Ranking", "Innovation Hub"],
        country: "USA",
        study_abroad_info: {
            visa_requirements: ["F1 Visa", "I-20 Form"],
            english_proficiency: ["TOEFL 100+", "IELTS 7.5+"]
        },
        description: "The world's top university for engineering and technology."
    },
    {
        name: "Stanford University",
        location: { state: "California", city: "Stanford" },
        type: "Private",
        fees: 4800000,
        exams_required: ["SAT", "ACT"],
        restart_score: 9.7,
        badges: ["Silicon Valley", "Entrepreneurship"],
        country: "USA",
        study_abroad_info: {
            visa_requirements: ["F1 Visa"],
            english_proficiency: ["TOEFL 100+"]
        },
        description: "Located in the heart of Silicon Valley."
    },
    {
        name: "University of Oxford",
        location: { state: "Oxford", city: "Oxford" },
        type: "Public",
        fees: 3500000,
        exams_required: ["A-Levels", "IELTS"],
        restart_score: 9.6,
        badges: ["Historic", "Research"],
        country: "UK",
        study_abroad_info: {
            visa_requirements: ["Student Visa"],
            english_proficiency: ["IELTS 7.5+"]
        },
        description: "The oldest university in the English-speaking world."
    },
    {
        name: "University of Toronto",
        location: { state: "Ontario", city: "Toronto" },
        type: "Public",
        fees: 3000000,
        exams_required: ["IELTS", "GPA"],
        restart_score: 9.2,
        badges: ["Top in Canada", "Research"],
        country: "Canada",
        study_abroad_info: {
            visa_requirements: ["Study Permit"],
            english_proficiency: ["IELTS 6.5+"]
        },
        description: "Canada's leading institution of learning."
    }
];
const seedData = async () => {
    try {
        await (0, db_1.default)();
        // Remove existing international colleges to avoid duplicates if re-run
        await College_1.default.deleteMany({ country: { $ne: 'India' } });
        await College_1.default.insertMany(internationalColleges);
        console.log('International Colleges seeded!');
        process.exit();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
seedData();
