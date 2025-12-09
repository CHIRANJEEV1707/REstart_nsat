require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const College = require('./src/models/College');
const Exam = require('./src/models/Exam');
const User = require('./src/models/User');
const PrepPlan = require('./src/models/PrepPlan');

const seedData = async () => {
    await connectDB();

    console.log('Clearing old data...');
    await College.deleteMany({});
    await Exam.deleteMany({});
    await User.deleteMany({});
    await PrepPlan.deleteMany({});

    console.log('Seeding Exams...');
    const exams = [
        {
            name: "JEE Main",
            code: "JEEMAIN",
            description: "National level entrance exam for NITs, IIITs and GFTIs.",
            dates: {
                registration_start: new Date('2025-11-01'),
                registration_end: new Date('2025-12-01'),
                exam_date_start: new Date('2026-01-24'),
                exam_date_end: new Date('2026-02-01')
            },
            eligibility: "Class 12 pass with Physics, Chemistry, Maths.",
            syllabus_url: "https://jeemain.nta.ac.in",
            website: "https://jeemain.nta.ac.in"
        },
        {
            name: "JEE Advanced",
            code: "JEEADV",
            description: "Entrance exam for IITs.",
            dates: {
                registration_start: new Date('2026-04-20'),
                registration_end: new Date('2026-05-07'),
                exam_date_start: new Date('2026-06-04'),
                exam_date_end: new Date('2026-06-04')
            },
            eligibility: "Top 2.5 Lakh rank in JEE Main.",
            syllabus_url: "https://jeeadv.ac.in",
            website: "https://jeeadv.ac.in"
        },
        {
            name: "BITSAT",
            code: "BITSAT",
            description: "Entrance exam for BITS Pilani, Goa, and Hyderabad.",
            dates: {
                registration_start: new Date('2026-01-15'),
                registration_end: new Date('2026-04-10'),
                exam_date_start: new Date('2026-05-15'),
                exam_date_end: new Date('2026-05-25')
            },
            eligibility: "75% aggregate in PCM in Class 12.",
            syllabus_url: "https://bitsadmission.com",
            website: "https://bitsadmission.com"
        },
        {
            name: "VITEEE",
            code: "VITEEE",
            description: "Entrance exam for VIT University campuses.",
            dates: {
                registration_start: new Date('2025-11-01'),
                registration_end: new Date('2026-03-31'),
                exam_date_start: new Date('2026-04-15'),
                exam_date_end: new Date('2026-04-21')
            },
            eligibility: "60% aggregate in PCM/PCB in Class 12.",
            syllabus_url: "https://vit.ac.in",
            website: "https://vit.ac.in"
        }
    ];

    await Exam.insertMany(exams);
    console.log(`Seeded ${exams.length} exams.`);

    console.log('Seeding Colleges...');
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad", "Kolkata"];
    const states = {
        "Mumbai": "Maharashtra", "Pune": "Maharashtra",
        "Delhi": "Delhi", "Bangalore": "Karnataka",
        "Chennai": "Tamil Nadu", "Hyderabad": "Telangana", "Kolkata": "West Bengal"
    };
    const collegeTypes = ["Public", "Private"];
    const badgesList = ["Top Ranked", "Best ROI", "Research Focused", "Good Placements", "Campus Life"];

    let colleges = [];
    for (let i = 1; i <= 50; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const state = states[city];
        const type = collegeTypes[Math.floor(Math.random() * collegeTypes.length)];
        const randomBadges = badgesList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3));

        colleges.push({
            name: `${type === 'Public' ? 'National Institute of Technology' : 'Institute of Technology'} ${city} (Campus ${i})`,
            location: { city, state },
            type: type,
            fees: Math.floor(Math.random() * 150000) + 50000,
            exams_required: i % 2 === 0 ? ["JEE Main"] : ["VITEEE", "BITSAT"],
            restart_score: (Math.random() * (10 - 6) + 6).toFixed(1),
            badges: randomBadges,
            description: `A premier institute in ${city} known for its engineering curriculum and industry connections.`,
            website: `https://example-college-${i}.edu`,
            placement_stats: {
                average_package: `${Math.floor(Math.random() * 10) + 4} LPA`,
                highest_package: `${Math.floor(Math.random() * 40) + 20} LPA`
            },
            admission_process: ["Check Eligibility", "Apply for Entrance Exam", "Submit Application", "Counseling Round"]
        });
    }

    // Add specific real ones for demo
    colleges[0] = {
        name: "Indian Institute of Technology, Bombay",
        location: { city: "Mumbai", state: "Maharashtra" },
        type: "Public",
        fees: 230000,
        exams_required: ["JEE Advanced", "JEE Main"],
        restart_score: 9.8,
        badges: ["Top Ranked", "Public", "Best ROI"],
        description: "IIT Bombay is recognized worldwide as a leader in the field of engineering education and research.",
        website: "https://www.iitb.ac.in",
        placement_stats: { average_package: "25 LPA", highest_package: "1 CR+" },
        admission_process: ["Crack JEE Main", "Crack JEE Advanced", "JoSAA Counseling"]
    };

    colleges[1] = {
        name: "Birla Institute of Technology and Science, Pilani",
        location: { city: "Pilani", state: "Rajasthan" },
        type: "Private",
        fees: 540000,
        exams_required: ["BITSAT"],
        restart_score: 9.5,
        badges: ["Tier 1", "Private"],
        description: "BITS Pilani is one of the premier private science and engineering institutes in India.",
        website: "https://www.bits-pilani.ac.in",
        placement_stats: { average_package: "20 LPA", highest_package: "60 LPA" },
        admission_process: ["Apply for BITSAT", "Score well in BITSAT", "Counseling"]
    };

    await College.insertMany(colleges);
    console.log(`Seeded ${colleges.length} colleges.`);

    console.log('Seeding Done!');
    process.exit();
};

seedData();
