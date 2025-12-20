import dotenv from 'dotenv';
import mongoose from 'mongoose';
import College from './models/College';

dotenv.config();

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
};

const IIT_LIST = [
    { name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", score: 9.9 },
    { name: "IIT Delhi", city: "New Delhi", state: "Delhi", score: 9.8 },
    { name: "IIT Madras", city: "Chennai", state: "Tamil Nadu", score: 9.9 },
    { name: "IIT Kanpur", city: "Kanpur", state: "Uttar Pradesh", score: 9.6 },
    { name: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", score: 9.5 },
    { name: "IIT Roorkee", city: "Roorkee", state: "Uttarakhand", score: 9.4 },
    { name: "IIT Guwahati", city: "Guwahati", state: "Assam", score: 9.3 },
    { name: "IIT Hyderabad", city: "Hyderabad", state: "Telangana", score: 9.2 },
    { name: "IIT BHU", city: "Varanasi", state: "Uttar Pradesh", score: 9.2 },
    { name: "IIT Indore", city: "Indore", state: "Madhya Pradesh", score: 9.1 },
    { name: "IIT Gandhinagar", city: "Gandhinagar", state: "Gujarat", score: 9.0 },
    { name: "IIT Ropar", city: "Rupnagar", state: "Punjab", score: 8.9 },
    { name: "IIT Patna", city: "Patna", state: "Bihar", score: 8.9 },
    { name: "IIT Mandi", city: "Mandi", state: "Himachal Pradesh", score: 8.8 },
    { name: "IIT Jodhpur", city: "Jodhpur", state: "Rajasthan", score: 8.8 },
    { name: "IIT Bhubaneswar", city: "Bhubaneswar", state: "Odisha", score: 8.7 },
    { name: "IIT Tirupati", city: "Tirupati", state: "Andhra Pradesh", score: 8.6 },
    { name: "IIT Palakkad", city: "Palakkad", state: "Kerala", score: 8.6 },
    { name: "IIT Jammu", city: "Jammu", state: "Jammu & Kashmir", score: 8.5 },
    { name: "IIT Dharwad", city: "Dharwad", state: "Karnataka", score: 8.5 },
    { name: "IIT Bhilai", city: "Bhilai", state: "Chhattisgarh", score: 8.4 },
    { name: "IIT Goa", city: "Goa", state: "Goa", score: 8.4 },
    { name: "IIT Dhanbad", city: "Dhanbad", state: "Jharkhand", score: 9.0 },
];

const generateIITs = () =>
    IIT_LIST.map((iit, index) => ({
        name: `Indian Institute of Technology ${iit.name.replace("IIT ", "")}`,
        location: { city: iit.city, state: iit.state },
        type: "Public",
        fees: 230000,
        exams_required: ["JEE Main", "JEE Advanced"],
        restart_score: iit.score,
        badges: [
            "Top Engineering Institute",
            index < 5 ? "Tier 1" : "Tier 2",
            "Government Funded",
        ],
        description: `${iit.name} is a premier public engineering institute known for academic excellence, research, and innovation.`,
        website: `https://www.${iit.name
            .toLowerCase()
            .replace(/\s+/g, "")}.ac.in`,
        placement_stats: {
            average_package: `${20 + Math.floor(iit.score * 2)} LPA`,
            highest_package: `${80 + index * 5} LPA`,
        },
        admission_process: [
            "Qualify JEE Main",
            "Qualify JEE Advanced",
            "JoSAA Counseling",
        ],
        country: "India",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
        study_abroad_info: {},
        isTrending: iit.score >= 9.5,
        trendingScore: Math.floor(iit.score * 10),
    }));

const seedIITs = async () => {
    try {
        await connectDB();

        console.log("Clearing existing IIT data...");
        // Use a more specific deletion to avoid wiping everything if that's not intended, 
        // but user's original script did this, so sticking to it but safer regex.
        await College.deleteMany({
            name: { $regex: /Indian Institute of Technology/i },
        });

        const iits = generateIITs();

        console.log("Seeding all IITs...");
        await College.insertMany(iits);

        console.log(`✅ Successfully seeded ${iits.length} IITs`);
        process.exit(0);
    } catch (err) {
        console.error("❌ IIT seeding failed:", err);
        process.exit(1);
    }
};

seedIITs();
