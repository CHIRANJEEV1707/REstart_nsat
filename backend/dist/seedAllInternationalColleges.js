"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const InternationalCollege_1 = __importDefault(require("./models/InternationalCollege"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const filePath = path_1.default.join(__dirname, '../internationalCollege.json');
const continentMap = {
    "USA": "North America",
    "Canada": "North America",
    "UK": "Europe",
    "Germany": "Europe",
    "France": "Europe",
    "Switzerland": "Europe",
    "Australia": "Oceania",
    "Singapore": "Asia",
    "New Zealand": "Oceania",
    "Ireland": "Europe",
    "Netherlands": "Europe",
    "Sweden": "Europe",
    "Japan": "Asia",
    "China": "Asia",
    "South Korea": "Asia",
    "Hong Kong": "Asia",
    "Malaysia": "Asia",
    "Italy": "Europe",
    "Spain": "Europe",
    "Russia": "Europe/Asia",
    "Austria": "Europe",
    "Belgium": "Europe",
    "Finland": "Europe",
    "Norway": "Europe",
    "Denmark": "Europe",
    "Scotland": "Europe"
};
const seedInternationalColleges = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
        const rawData = fs_1.default.readFileSync(filePath, 'utf-8');
        const sourceData = JSON.parse(rawData);
        console.log(`Found ${sourceData.length} colleges in JSON.`);
        // Transform data
        const transformedData = sourceData.map((college) => {
            // Map exams
            const exams = college.exams_required || [];
            const englishTests = exams.filter((e) => e.includes('TOEFL') || e.includes('IELTS') || e.includes('PTE'));
            const entranceExams = exams.filter((e) => !englishTests.includes(e));
            // Default ranking
            let ranking = 999;
            const rankBadge = college.badges?.find((b) => b.includes('Rank #'));
            if (rankBadge) {
                const match = rankBadge.match(/Rank #(\d+)/);
                if (match)
                    ranking = parseInt(match[1]);
            }
            return {
                name: college.name,
                country: college.country,
                city: college.location?.city || "Unknown",
                continent: continentMap[college.country] || "World",
                university_type: college.type === 'Private' ? 'Private' : 'Public', // Mapping 'Private'/'Public'
                description: college.description || `One of the top institutions in ${college.country}.`,
                official_website: college.website || "#",
                global_ranking: ranking,
                ranking_body: "QS",
                acceptance_rate: 50, // Default
                restart_score: college.restart_score || 0,
                degrees_offered: ["Undergraduate", "Postgraduate"],
                entrance_exams: entranceExams,
                english_tests: englishTests,
                minimum_scores: { sat: 0, act: 0, ielts: 6.0, toefl: 80 },
                tuition_fee_annual: college.fees || 0, // This is now in INR
                living_cost_annual: 1000000, // Default ~10-15 Lakhs INR estimate
                application_fee: 5000, // Default ~5k INR
                scholarships_available: true,
                scholarships: [],
                visa_type: "Student Visa",
                application_deadlines: { fall: new Date("2025-09-01") },
                application_portal_url: college.website || "#",
                required_documents: ["Transcripts", "Passport", "SOP"],
                badges: college.badges || [],
                isTrending: college.isTrending || false,
                trendingScore: college.trendingScore || 0,
                image: college.image // Ensure this is saved
            };
        });
        console.log("Removing existing international colleges...");
        await InternationalCollege_1.default.deleteMany({});
        console.log(`Seeding ${transformedData.length} colleges...`);
        await InternationalCollege_1.default.insertMany(transformedData);
        console.log("✅ Seed complete!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding:", err);
        process.exit(1);
    }
};
seedInternationalColleges();
