import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InternationalCollege from '../models/InternationalCollege';
import connectDB from '../config/db';

dotenv.config();

const internationalColleges = [
    {
        name: "Massachusetts Institute of Technology (MIT)",
        country: "USA",
        city: "Cambridge",
        continent: "North America",
        university_type: "Private",
        description: "The world's top university for engineering and technology.",
        official_website: "https://web.mit.edu",
        global_ranking: 1,
        ranking_body: "QS",
        acceptance_rate: 4,
        restart_score: 9.8,
        degrees_offered: ["B.Sc", "M.Sc", "PhD", "MBA"],
        entrance_exams: ["SAT", "ACT", "GRE"],
        english_tests: ["TOEFL", "IELTS"],
        minimum_scores: {
            sat: 1500,
            act: 34,
            ielts: 7.5,
            toefl: 100
        },
        tuition_fee_annual: 55000,
        living_cost_annual: 20000,
        application_fee: 75,
        scholarships_available: true,
        scholarships: [
            { name: "MIT Scholarship", amount: "Full Ride", criteria: "Need-based" }
        ],
        visa_type: "F1",
        application_deadlines: {
            fall: new Date("2024-01-01"),
            spring: new Date("2024-11-01")
        },
        application_portal_url: "https://mitadmissions.org/",
        required_documents: ["SOP", "LOR", "Transcripts"],
        badges: ["#1 World Ranking", "Innovation Hub"],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_building_10_and_the_Great_Dome_Cambridge_MA.jpg/1280px-MIT_building_10_and_the_Great_Dome_Cambridge_MA.jpg"
    },
    {
        name: "University of Oxford",
        country: "UK",
        city: "Oxford",
        continent: "Europe",
        university_type: "Public",
        description: "The oldest university in the English-speaking world.",
        official_website: "https://www.ox.ac.uk",
        global_ranking: 2,
        ranking_body: "QS",
        acceptance_rate: 17,
        restart_score: 9.6,
        degrees_offered: ["BA", "MSc", "DPhil"],
        entrance_exams: ["A-Levels"],
        english_tests: ["IELTS"],
        minimum_scores: {
            sat: 1470,
            act: 32,
            ielts: 7.5,
            toefl: 110
        },
        tuition_fee_annual: 40000,
        living_cost_annual: 15000,
        application_fee: 100,
        scholarships_available: true,
        scholarships: [
            { name: "Rhodes Scholarship", amount: "Full Funding", criteria: "Merit-based" }
        ],
        visa_type: "Tier 4",
        application_deadlines: {
            fall: new Date("2023-10-15"),
            spring: null
        },
        application_portal_url: "https://www.ucas.com/",
        required_documents: ["UCAS Essay", "LOR"],
        badges: ["Historic", "Research Powerhouse"],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Oxford_University_Arms.svg/1200px-Oxford_University_Arms.svg.png"
    },
    {
        name: "Stanford University",
        country: "USA",
        city: "Stanford",
        continent: "North America",
        university_type: "Private",
        description: "Located in the heart of Silicon Valley.",
        official_website: "https://www.stanford.edu",
        global_ranking: 3,
        ranking_body: "QS",
        acceptance_rate: 5,
        restart_score: 9.7,
        degrees_offered: ["B.S.", "M.S.", "PhD"],
        entrance_exams: ["SAT", "ACT"],
        english_tests: ["TOEFL"],
        minimum_scores: {
            sat: 1520,
            act: 35,
            ielts: 8.0,
            toefl: 105
        },
        tuition_fee_annual: 60000,
        living_cost_annual: 25000,
        application_fee: 90,
        scholarships_available: true,
        scholarships: [
            { name: "Knight-Hennessy Scholars", amount: "Full Funding", criteria: "Leadership" }
        ],
        visa_type: "F1",
        application_deadlines: {
            fall: new Date("2024-01-05"),
            spring: null
        },
        application_portal_url: "https://admission.stanford.edu/",
        required_documents: ["SOP", "3 LORs", "Transcripts"],
        badges: ["Silicon Valley", "Entrepreneurship"],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Stanford_University_Hoover_Tower_from_Palm_Drive.jpg/1200px-Stanford_University_Hoover_Tower_from_Palm_Drive.jpg"
    }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing International Colleges...');
        await InternationalCollege.deleteMany({});

        console.log('Seeding International Colleges...');
        await InternationalCollege.insertMany(internationalColleges);

        console.log('International Colleges seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
