require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db').default;
const College = require('./src/models/College').default;
const Exam = require('./src/models/Exam').default;
const User = require('./src/models/User').default;
const PrepPlan = require('./src/models/PrepPlan').default;

const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('Clearing old data...');
        await College.deleteMany({});
        await Exam.deleteMany({});
        await User.deleteMany({});
        await PrepPlan.deleteMany({});

        // -----------------------------------------------------
        // 1. SEED EXAMS
        // -----------------------------------------------------
        console.log('Seeding Exams...');
        const examsData = [
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
            },
            {
                name: "MHT CET",
                code: "MHTCET",
                description: "Maharashtra Common Entrance Test for engineering and pharmacy.",
                dates: {
                    registration_start: new Date('2026-03-01'),
                    registration_end: new Date('2026-04-15'),
                    exam_date_start: new Date('2026-05-10'),
                    exam_date_end: new Date('2026-05-20')
                },
                eligibility: "HSC pass from Maharashtra Board or equivalent.",
                syllabus_url: "https://cetcell.mahacet.org",
                website: "https://cetcell.mahacet.org"
            },
            {
                name: "WBJEE",
                code: "WBJEE",
                description: "West Bengal Joint Entrance Examination.",
                dates: {
                    registration_start: new Date('2025-12-25'),
                    registration_end: new Date('2026-01-31'),
                    exam_date_start: new Date('2026-04-28'),
                    exam_date_end: new Date('2026-04-28')
                },
                eligibility: "Class 12 pass with subjects P/C/M, domiciled in West Bengal.",
                syllabus_url: "https://wbjeeb.nic.in",
                website: "https://wbjeeb.nic.in"
            },
            {
                name: "SAT",
                code: "SAT",
                description: "Scholastic Assessment Test for undergraduate admission abroad.",
                dates: {
                    registration_start: new Date('2025-08-01'),
                    registration_end: new Date('2026-05-01'),
                    exam_date_start: new Date('2026-03-14'), // March attempt
                    exam_date_end: new Date('2026-03-14')
                },
                eligibility: "High school student.",
                syllabus_url: "https://satsuite.collegeboard.org",
                website: "https://collegeboard.org"
            },
            {
                name: "IELTS",
                code: "IELTS",
                description: "International English Language Testing System.",
                dates: {
                    registration_start: new Date('2025-01-01'),
                    registration_end: new Date('2026-12-31'),
                    exam_date_start: new Date('2026-01-15'),
                    exam_date_end: new Date('2026-12-15')
                },
                eligibility: "No strict eligibility criteria.",
                syllabus_url: "https://ielts.org",
                website: "https://ielts.org"
            }
        ];

        const createdExams = await Exam.insertMany(examsData);
        console.log(`Seeded ${createdExams.length} exams`);

        // Map exam codes to IDs for easier usage
        const examMap = {};
        createdExams.forEach(e => { examMap[e.code] = e._id; });

        // -----------------------------------------------------
        // 2. SEED COLLEGES (50)
        // -----------------------------------------------------
        console.log('Seeding Colleges...');
        const colleges = [];

        // Data Pools
        const cities = [
            { name: "Mumbai", state: "Maharashtra" },
            { name: "Pune", state: "Maharashtra" },
            { name: "Delhi", state: "Delhi" },
            { name: "Bangalore", state: "Karnataka" },
            { name: "Chennai", state: "Tamil Nadu" },
            { name: "Hyderabad", state: "Telangana" },
            { name: "Kolkata", state: "West Bengal" },
            { name: "Jaipur", state: "Rajasthan" },
            { name: "Ahmedabad", state: "Gujarat" }
        ];

        const collegeTypes = ["Public", "Private"];
        const badgesList = ["Top Ranked", "Best ROI", "Research Focused", "Good Placements", "Campus Life", "Innovator", "Green Campus"];

        const branches = ["Technology", "Engineering", "Science", "Research"];

        for (let i = 1; i <= 50; i++) {
            const cityObj = { ...cities[Math.floor(Math.random() * cities.length)] };
            let type = Math.random() > 0.4 ? "Private" : "Public"; // 60% Private, 40% Public
            const badgeCount = Math.floor(Math.random() * 3) + 1;
            const selectedBadges = badgesList.sort(() => 0.5 - Math.random()).slice(0, badgeCount);

            // Logic for realistic Fees & Exams
            let fees, requiredExams;
            if (type === "Public") {
                fees = Math.floor(Math.random() * 100000) + 20000; // 20k - 1.2L
                requiredExams = ["JEE Main"];
                if (Math.random() > 0.7) requiredExams.push("JEE Advanced");
            } else {
                fees = Math.floor(Math.random() * 300000) + 150000; // 1.5L - 4.5L
                requiredExams = ["JEE Main", "VITEEE", "BITSAT", "MHTCET"];
                // Pick 1-2 random private/state exams
                requiredExams = requiredExams.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
            }

            // International Colls (approx 5)
            let isInternational = false;
            let country = "India";
            if (i > 45) {
                isInternational = true;
                const intlLocs = [
                    { city: "Cambridge", state: "MA", country: "USA" },
                    { city: "London", state: "England", country: "UK" },
                    { city: "Toronto", state: "Ontario", country: "Canada" },
                    { city: "Melbourne", state: "Victoria", country: "Australia" }
                ];
                const loc = intlLocs[Math.floor(Math.random() * intlLocs.length)];
                cityObj.name = loc.city;
                cityObj.state = loc.state;
                country = loc.country;
                type = "Private";
                fees = Math.floor(Math.random() * 4000000) + 2000000; // 20L - 60L
                requiredExams = ["SAT", "IELTS"];
                selectedBadges.push("Global Top 100");
            }

            colleges.push({
                name: `${isInternational ? 'University of' : 'Institute of'} ${branches[Math.floor(Math.random() * branches.length)]}, ${cityObj.name} ${isInternational ? '' : '(Campus ' + i + ')'}`,
                location: {
                    city: cityObj.name,
                    state: cityObj.state
                },
                country: country,
                type: type,
                fees: fees,
                exams_required: requiredExams,
                restart_score: (Math.random() * (9.9 - 6.0) + 6.0).toFixed(1),
                badges: selectedBadges,
                description: `A leading institution in ${cityObj.name} offering world-class education and research opportunities. Focused on holistic student development.`,
                website: `https://example-${i}.edu`,
                placement_stats: {
                    average_package: `${Math.floor(Math.random() * 10) + 5} LPA`,
                    highest_package: `${Math.floor(Math.random() * 50) + 15} LPA`
                },
                admission_process: ["Check Eligibility", "Entrance Exam", "Application Submission", "Interview/Counseling"],
                study_abroad_info: isInternational ? {
                    visa_requirements: ["Student Visa", "Proof of Funds"],
                    english_proficiency: ["IELTS 6.5+", "TOEFL 90+"],
                    scholarships_available: ["Merit Scholarship", "Need-based Aid"]
                } : undefined
            });
        }

        // Demo Overrides
        colleges[0] = {
            name: "Indian Institute of Technology, Bombay",
            location: { city: "Mumbai", state: "Maharashtra" },
            country: "India",
            type: "Public",
            fees: 250000,
            exams_required: ["JEE Advanced", "JEE Main"],
            restart_score: 9.9,
            badges: ["Top Ranked", "Best ROI", "Research Focused"],
            description: "IIT Bombay is recognized worldwide as a leader in the field of engineering education and research.",
            website: "https://www.iitb.ac.in",
            placement_stats: { average_package: "25 LPA", highest_package: "1.5 CR+" },
            admission_process: ["Qualify JEE Main", "Crack JEE Advanced", "JoSAA Counseling"]
        };

        colleges[1] = {
            name: "Birla Institute of Technology and Science, Pilani",
            location: { city: "Pilani", state: "Rajasthan" },
            country: "India",
            type: "Private",
            fees: 600000,
            exams_required: ["BITSAT"],
            restart_score: 9.6,
            badges: ["Tier 1", "Private", "No Reservations"],
            description: "BITS Pilani is known for its flexible academic structure and strong alumni network.",
            website: "https://www.bits-pilani.ac.in",
            placement_stats: { average_package: "22 LPA", highest_package: "60 LPA" },
            admission_process: ["Apply for BITSAT", "Score Priority Merit", "Counseling"]
        };

        colleges[2] = {
            name: "Massachusetts Institute of Technology (MIT)",
            location: { city: "Cambridge", state: "Massachusetts" },
            country: "USA",
            type: "Private",
            fees: 4500000,
            exams_required: ["SAT", "IELTS"],
            restart_score: 9.9,
            badges: ["World #1", "Research", "Innovation"],
            description: "MIT is a world-class research university dedicated to advancing knowledge and educating students in science, technology, and other areas of scholarship.",
            website: "https://web.mit.edu",
            placement_stats: { average_package: "$120,000", highest_package: "$250,000+" },
            admission_process: ["Common App", "SAT/ACT", "Essays", "Interview"],
            study_abroad_info: {
                visa_requirements: ["F1 Visa"],
                english_proficiency: ["TOEFL 100+"],
                scholarships_available: ["Need-Blind Admission"]
            }
        };

        await College.insertMany(colleges);
        console.log(`Seeded ${colleges.length} colleges.`);

        // -----------------------------------------------------
        // 3. SEED USERS (10)
        // -----------------------------------------------------
        console.log('Seeding Users...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt); // Default password for all

        const usersData = [];
        const userNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan"];

        for (let i = 0; i < 10; i++) {
            usersData.push({
                name: `${userNames[i]} Sharma`,
                email: `user${i + 1}@example.com`,
                password: hashedPassword,
                role: 'student',
                state: cities[i % cities.length].state,
                class_level: i % 2 === 0 ? "12th" : "Dropper",
                target_degree: "B.Tech",
                target_exams: i % 2 === 0 ? ["JEE Main", "BITSAT"] : ["JEE Main", "JEE Advanced"],
                budget_range: { min: 100000, max: 500000 }
            });
        }

        const createdUsers = await User.insertMany(usersData);
        console.log(`Seeded ${createdUsers.length} users`);

        // -----------------------------------------------------
        // 4. SEED PREP PLANS (Minimal)
        // -----------------------------------------------------
        console.log('Seeding Prep Plans...');
        const prepPlans = [];

        // Assign a prep plan to first 5 users
        for (let i = 0; i < 5; i++) {
            const user = createdUsers[i];
            // Assign JEE Main as default target
            prepPlans.push({
                user: user._id,
                exam: examMap["JEEMAIN"],
                status: 'active',
                weeks: [
                    {
                        weekNumber: 1,
                        subjects: {
                            Physics: ["Kinematics", "Laws of Motion"],
                            Chemistry: ["Atomic Structure", "Mole Concept"],
                            Math: ["Sets", "Quadratic Equations"]
                        },
                        completed: true
                    },
                    {
                        weekNumber: 2,
                        subjects: {
                            Physics: ["Work Power Energy"],
                            Chemistry: ["Periodic Table"],
                            Math: ["Sequences and Series"]
                        },
                        completed: false
                    }
                ]
            });
        }

        await PrepPlan.insertMany(prepPlans);
        console.log(`Seeded ${prepPlans.length} prep plans`);

        console.log('Seed complete');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
