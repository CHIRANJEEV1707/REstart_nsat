"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const College_1 = __importDefault(require("./models/College"));
dotenv_1.default.config();
const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined');
    }
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
};
const NIT_LIST = [
    { name: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", score: 9.5 },
    { name: "NIT Surathkal", city: "Surathkal", state: "Karnataka", score: 9.4 },
    { name: "NIT Warangal", city: "Warangal", state: "Telangana", score: 9.4 },
    { name: "NIT Rourkela", city: "Rourkela", state: "Odisha", score: 9.3 },
    { name: "NIT Calicut", city: "Kozhikode", state: "Kerala", score: 9.2 },
    { name: "NIT Allahabad", city: "Prayagraj", state: "Uttar Pradesh", score: 9.2 },
    { name: "NIT Jaipur", city: "Jaipur", state: "Rajasthan", score: 9.1 },
    { name: "NIT Bhopal", city: "Bhopal", state: "Madhya Pradesh", score: 9.0 },
    { name: "NIT Durgapur", city: "Durgapur", state: "West Bengal", score: 8.9 },
    { name: "NIT Kurukshetra", city: "Kurukshetra", state: "Haryana", score: 8.9 },
    { name: "NIT Silchar", city: "Silchar", state: "Assam", score: 8.8 },
    { name: "NIT Jamshedpur", city: "Jamshedpur", state: "Jharkhand", score: 8.8 },
    { name: "NIT Hamirpur", city: "Hamirpur", state: "Himachal Pradesh", score: 8.7 },
    { name: "NIT Srinagar", city: "Srinagar", state: "Jammu & Kashmir", score: 8.7 },
    { name: "NIT Patna", city: "Patna", state: "Bihar", score: 8.6 },
    { name: "NIT Raipur", city: "Raipur", state: "Chhattisgarh", score: 8.6 },
    { name: "NIT Agartala", city: "Agartala", state: "Tripura", score: 8.5 },
    { name: "NIT Arunachal Pradesh", city: "Yupia", state: "Arunachal Pradesh", score: 8.4 },
    { name: "NIT Delhi", city: "New Delhi", state: "Delhi", score: 8.8 },
    { name: "NIT Goa", city: "Goa", state: "Goa", score: 8.5 },
    { name: "NIT Manipur", city: "Imphal", state: "Manipur", score: 8.3 },
    { name: "NIT Meghalaya", city: "Shillong", state: "Meghalaya", score: 8.3 },
    { name: "NIT Mizoram", city: "Aizawl", state: "Mizoram", score: 8.2 },
    { name: "NIT Nagaland", city: "Dimapur", state: "Nagaland", score: 8.2 },
    { name: "NIT Puducherry", city: "Karaikal", state: "Puducherry", score: 8.4 },
    { name: "NIT Sikkim", city: "Ravangla", state: "Sikkim", score: 8.2 },
    { name: "NIT Uttarakhand", city: "Srinagar", state: "Uttarakhand", score: 8.3 },
    { name: "NIT Andhra Pradesh", city: "Tadepalligudem", state: "Andhra Pradesh", score: 8.4 },
    { name: "NIT Nagpur", city: "Nagpur", state: "Maharashtra", score: 9.0 },
    { name: "NIT Surat", city: "Surat", state: "Gujarat", score: 8.9 },
    { name: "NIT Jalandhar", city: "Jalandhar", state: "Punjab", score: 8.8 },
];
const generateNITs = () => NIT_LIST.map((nit, index) => ({
    name: `National Institute of Technology ${nit.name.replace("NIT ", "")}`,
    location: { city: nit.city, state: nit.state },
    type: "Public",
    fees: 200000,
    exams_required: ["JEE Main"],
    restart_score: nit.score,
    badges: [
        "National Importance",
        nit.score >= 9.2 ? "Top NIT" : "Emerging NIT",
        "Government Funded",
    ],
    description: `${nit.name} is a centrally funded public engineering institution known for quality technical education and research.`,
    website: `https://www.nit${nit.name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("nit", "")}.ac.in`,
    placement_stats: {
        average_package: `${12 + Math.floor(nit.score * 1.5)} LPA`,
        highest_package: `${40 + index * 3} LPA`,
    },
    admission_process: [
        "Qualify JEE Main",
        "Participate in JoSAA Counseling",
    ],
    country: "India",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
    study_abroad_info: {},
    isTrending: nit.score >= 9.2,
    trendingScore: Math.floor(nit.score * 10),
}));
const seedNITs = async () => {
    try {
        await connectDB();
        console.log("Clearing existing NIT data...");
        await College_1.default.deleteMany({
            name: { $regex: /National Institute of Technology/i },
        });
        const nits = generateNITs();
        console.log("Seeding all NITs...");
        await College_1.default.insertMany(nits);
        console.log(`✅ Successfully seeded ${nits.length} NITs`);
        process.exit(0);
    }
    catch (err) {
        console.error("❌ NIT seeding failed:", err);
        process.exit(1);
    }
};
seedNITs();
