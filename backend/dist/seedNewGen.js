"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const NewGenCollege_1 = __importDefault(require("./models/NewGenCollege"));
dotenv_1.default.config();
const newGenCollegesData = [
    {
        _id: "693dcf674d0abb867d78aba1",
        name: "Newton School of Technology",
        shortName: "NST",
        location: {
            city: "Sonepat",
            state: "Haryana",
            country: "India"
        },
        degreeOffered: ["B.Tech"],
        category: "New-Gen",
        examsAccepted: ["NSAT"],
        fees: {
            amountINR: 650000,
            paymentModel: "Upfront"
        },
        cohortDetails: {
            batchSize: 150,
            mode: "Residential"
        },
        curriculumFocus: ["Computer Science", "Artificial Intelligence", "Entrepreneurship"],
        industryPartners: ["Google", "Zomato", "Dream11", "Meesho"],
        placementSupport: {
            guaranteed: true,
            averageCTC: 1200000,
            highestCTC: 3500000
        },
        admissionProcess: ["NSAT Exam", "Interview"],
        highlights: [
            "Residential Campus near Delhi NCR",
            "Mentorship from MAANG leaders",
            "Focus on building startups"
        ],
        website: "https://www.newtonschool.co/newton-school-of-technology",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        isActive: true,
        isTrending: true,
        trendingScore: 100,
        createdAt: new Date()
    },
    {
        name: "Scaler School of Technology",
        shortName: "Scaler",
        location: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India"
        },
        degreeOffered: ["B.Tech"],
        category: "New-Gen",
        examsAccepted: ["NSET"],
        fees: {
            amountINR: 400000,
            paymentModel: "Hybrid"
        },
        cohortDetails: {
            batchSize: 200,
            mode: "Residential"
        },
        curriculumFocus: ["Full Stack Development", "System Design", "Backend Engineering"],
        industryPartners: ["Amazon", "Uber", "Microsoft", "Media.net"],
        placementSupport: {
            guaranteed: false,
            averageCTC: 2300000,
            highestCTC: 4500000
        },
        admissionProcess: ["NSET", "Interview"],
        highlights: [
            "Located in Bangalore's Tech Hub",
            "1:1 Mentorship",
            "Industry-vetted curriculum"
        ],
        website: "https://www.scaler.com/school-of-technology/",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        isActive: true,
        createdAt: new Date()
    },
    {
        name: "Polaris School of Technology",
        shortName: "Polaris",
        location: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India"
        },
        degreeOffered: ["B.Tech"],
        category: "New-Gen",
        examsAccepted: ["PAT"],
        fees: {
            amountINR: 500000,
            paymentModel: "Income Share Agreement"
        },
        cohortDetails: {
            batchSize: 60,
            mode: "Hybrid"
        },
        curriculumFocus: ["Product Management", "Data Science", "Software Engineering"],
        industryPartners: ["Flipkart", "Razorpay", "Cred"],
        placementSupport: {
            guaranteed: true,
            averageCTC: 1800000,
            highestCTC: 3000000
        },
        admissionProcess: ["PAT Exam", "Group Discussion"],
        highlights: [
            "Focus on Product Thinking",
            "Zero Upfront Tuition Options",
            "Small Batch Size"
        ],
        website: "https://www.polarisschool.com",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        isActive: true,
        createdAt: new Date()
    },
    {
        name: "Vedam School of Technology",
        shortName: "Vedam",
        location: {
            city: "Hyderabad",
            state: "Telangana",
            country: "India"
        },
        degreeOffered: ["B.Tech"],
        category: "New-Gen",
        examsAccepted: ["Internal Aptitude Test"],
        fees: {
            amountINR: 450000,
            paymentModel: "Hybrid"
        },
        cohortDetails: {
            batchSize: 100,
            mode: "Residential"
        },
        curriculumFocus: ["Cloud Computing", "DevOps", "Cyber Security"],
        industryPartners: ["Oracle", "Salesforce", "ServiceNow"],
        placementSupport: {
            guaranteed: false,
            averageCTC: 1500000,
            highestCTC: 2800000
        },
        admissionProcess: ["Aptitude Test", "Personal Interview"],
        highlights: [
            "Specialization in Cloud & DevOps",
            "State-of-the-art Lab Facilities",
            "Strong Alumni Network"
        ],
        website: "https://www.vedamschool.com", // Placeholder URL
        image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        isActive: true,
        createdAt: new Date()
    }
];
const seedNewGenColleges = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");
        console.log("Clearing existing New-Gen Colleges...");
        await NewGenCollege_1.default.deleteMany({});
        console.log("Existing data cleared.");
        console.log("Seeding New-Gen Colleges...");
        await NewGenCollege_1.default.insertMany(newGenCollegesData);
        console.log("New-Gen Colleges seeded successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding New-Gen Colleges:", error);
        process.exit(1);
    }
};
seedNewGenColleges();
