"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Exam_1 = __importDefault(require("./models/Exam"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    }
    catch (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1);
    }
};
const seedExams = async () => {
    try {
        await connectDB();
        // Read data from JSON file
        const jsonPath = path_1.default.join(__dirname, '../examList.json');
        if (!fs_1.default.existsSync(jsonPath)) {
            console.error(`❌ JSON file not found at: ${jsonPath}`);
            process.exit(1);
        }
        const fileContent = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const examData = JSON.parse(fileContent);
        console.log(`Read ${examData.length} exams from examList.json`);
        console.log("Clearing existing Exam data...");
        await Exam_1.default.deleteMany({});
        console.log(`Seeding ${examData.length} exams given to database...`);
        // Filter out __v if it exists, although mongoose usually handles it.
        const cleanedData = examData.map((exam) => {
            const { __v, ...rest } = exam;
            return rest;
        });
        await Exam_1.default.insertMany(cleanedData);
        console.log(`✅ Successfully seeded ${cleanedData.length} exams`);
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};
seedExams();
