"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const College_1 = __importDefault(require("./models/College"));
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
const seedColleges = async () => {
    try {
        await connectDB();
        // Read data from JSON file
        const jsonPath = path_1.default.join(__dirname, '../indianCollege.json');
        const fileContent = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const collegeData = JSON.parse(fileContent);
        console.log(`Read ${collegeData.length} colleges from indianCollege.json`);
        console.log("Clearing existing Indian college data...");
        // Clear all colleges that are likely from this dataset. 
        // Using a broad regex for now or specific types if we want to be safer,
        // but given the previous step was regex based, we can clear by the types we are about to insert.
        // Or simply delete all with country 'India' if that field existed, but it doesn't seem to be in the schema explicitly shown yet,
        // actually the schema likely has it or defaults.
        // Let's stick to the previous strategy of clearing by Name regex which was effective, 
        // OR better, we can clear based on the Types we are inserting.
        // However, 'Public' and 'Private' are generic. 
        // Validating the JSON, these are "Indian Institute of Technology...", "National Institute...", 
        // "Indian Institute of Information...", "Indian Institute of Science...", etc.
        // To be safe and clean, let's delete strictly matches that we are re-inserting, 
        // but replacing the whole collection might be too aggressive if there are other colleges.
        // Let's use the regex approach that worked for cleaning up mixed data, extended with new names.
        // Or better, since we are replacing the canonical list of these colleges:
        await College_1.default.deleteMany({
            $or: [
                { name: { $regex: /Indian Institute of Technology/i } },
                { name: { $regex: /National Institute of Technology/i } },
                { name: { $regex: /Indian Institute of Information Technology/i } },
                { name: { $regex: /School of Planning and Architecture/i } },
                { name: { $regex: /Indian Institute of Science/i } },
                { type: { $in: ['IIIT', 'GFTI', 'Public Research University', 'Public Research Institute', 'Public Deemed University', 'Private Deemed University', 'Deemed University', 'Central University', 'Institute of National Importance', 'State University', 'University Department', 'Central Institute', 'State-Aided Autonomous', 'State University Campus', 'State Government College', 'State Government Aided', 'Private Autonomous', 'Private University'] } }
            ]
        });
        console.log(`Seeding ${collegeData.length} colleges from JSON...`);
        await College_1.default.insertMany(collegeData);
        console.log(`✅ Successfully seeded ${collegeData.length} colleges`);
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};
seedColleges();
