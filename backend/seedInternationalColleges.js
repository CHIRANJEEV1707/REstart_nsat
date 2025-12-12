require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db').default;
const InternationalCollege = require('./src/models/InternationalCollege').default;

const seedInternationalColleges = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Clear ONLY International Colleges
        console.log('Clearing old International Colleges...');
        await InternationalCollege.deleteMany({});
        console.log('Cleared.');

        const colleges = [
            {
                name: "Massachusetts Institute of Technology (MIT)",
                country: "USA",
                city: "Cambridge",
                continent: "North America",
                university_type: "Private",
                description: "MIT is a world-class educational institution. Teaching and research—with relevance to the practical world as a guiding principle—continue to be its primary purpose.",
                official_website: "https://www.mit.edu",
                global_ranking: 1,
                ranking_body: "QS",
                acceptance_rate: 4,
                restart_score: 9.9,
                degrees_offered: ["B.Sc Computer Science", "B.Eng Mechanical", "B.Sc Physics"],
                entrance_exams: ["SAT", "ACT"],
                english_tests: ["TOEFL", "IELTS"],
                minimum_scores: { sat: 1500, act: 34, ielts: 7.5, toefl: 100 },
                tuition_fee_annual: 57000,
                living_cost_annual: 18000,
                application_fee: 75,
                scholarships_available: true,
                scholarships: [{ name: "MIT Scholarship", amount: "Need-based up to full tuition", criteria: "Financial need" }],
                visa_type: "F1",
                application_deadlines: { fall: "2025-01-01", spring: "2024-11-01" },
                application_portal_url: "https://my.mit.edu",
                required_documents: ["SOP", "2 LORs", "School Transcripts", "Financial Statement"],
                badges: ["Top Ranked", "Innovation Hub"]
            },
            {
                name: "Stanford University",
                country: "USA",
                city: "Stanford",
                continent: "North America",
                university_type: "Private",
                description: "Stanford University continues to be dedicated to finding solutions to big challenges and to preparing students for leadership in a complex world.",
                official_website: "https://www.stanford.edu",
                global_ranking: 3,
                ranking_body: "QS",
                acceptance_rate: 3.9,
                restart_score: 9.8,
                degrees_offered: ["B.S. Computer Science", "B.S. Electrical Engineering"],
                entrance_exams: ["SAT", "ACT"],
                english_tests: ["TOEFL"],
                minimum_scores: { sat: 1480, act: 33, ielts: 7.5, toefl: 100 },
                tuition_fee_annual: 62000,
                living_cost_annual: 20000,
                application_fee: 90,
                scholarships_available: true,
                scholarships: [{ name: "Stanford Financial Aid", amount: "Full need met", criteria: "Income < $150k" }],
                visa_type: "F1",
                application_deadlines: { fall: "2025-01-05" },
                application_portal_url: "https://admission.stanford.edu",
                required_documents: ["SOP", "Teacher Evaluations", "Counselor Recommendation", "Transcripts"],
                badges: ["Entrepreneurship", "Silicon Valley"]
            },
            {
                name: "University of Oxford",
                country: "UK",
                city: "Oxford",
                continent: "Europe",
                university_type: "Public",
                description: "The University of Oxford is the oldest university in the English-speaking world and one of the world's leading academic institutions.",
                official_website: "https://www.ox.ac.uk",
                global_ranking: 4,
                ranking_body: "QS",
                acceptance_rate: 17,
                restart_score: 9.7,
                degrees_offered: ["BA Computer Science", "MEng Engineering Science"],
                entrance_exams: [], // UK usually looks at A-levels/IB but sometimes SAT for US applicants
                english_tests: ["IELTS", "TOEFL"],
                minimum_scores: { sat: 1470, ielts: 7.5, toefl: 110, act: 32 },
                tuition_fee_annual: 45000, // Converted approx USD
                living_cost_annual: 15000,
                application_fee: 30, // UCAS fee approx
                scholarships_available: true,
                scholarships: [{ name: "Rhodes Scholarship", amount: "Full Ride", criteria: "Global excellence" }],
                visa_type: "Tier 4",
                application_deadlines: { fall: "2024-10-15" },
                application_portal_url: "https://www.ucas.com",
                required_documents: ["Personal Statement", "Reference", "Predicted Grades"],
                badges: ["Historic", "Research"]
            },
            {
                name: "National University of Singapore (NUS)",
                country: "Singapore",
                city: "Singapore",
                continent: "Asia",
                university_type: "Public",
                description: "A leading global university centred in Asia, NUS is Singapore's flagship university which offers a global approach to education and research.",
                official_website: "https://www.nus.edu.sg",
                global_ranking: 8,
                ranking_body: "QS",
                acceptance_rate: 5,
                restart_score: 9.5,
                degrees_offered: ["BComp Computer Science", "BEng Civil Engineering"],
                entrance_exams: ["SAT", "ACT"], // Accepts these from international students
                english_tests: ["IELTS", "TOEFL"],
                minimum_scores: { sat: 1450, ielts: 6.5, toefl: 92 },
                tuition_fee_annual: 30000, // USD approx
                living_cost_annual: 12000,
                application_fee: 20,
                scholarships_available: true,
                scholarships: [{ name: "ASEAN Undergraduate Scholarship", amount: "Tuition + Stipend", criteria: "ASEAN citizens" }],
                visa_type: "Student Pass",
                application_deadlines: { fall: "2025-02-28" },
                application_portal_url: "https://www.nus.edu.sg/oam",
                required_documents: ["Transcripts", "Passport Copy", "Co-curricular records"],
                badges: ["Top in Asia", "Global City"]
            },
            {
                name: "ETH Zurich",
                country: "Switzerland",
                city: "Zurich",
                continent: "Europe",
                university_type: "Public",
                description: "ETH Zurich is one of the world's leading universities in science and technology and is known for its cutting-edge research and innovation.",
                official_website: "https://ethz.ch",
                global_ranking: 7,
                ranking_body: "QS",
                acceptance_rate: 27,
                restart_score: 9.4,
                degrees_offered: ["BSc Computer Science", "BSc Mechanical Engineering"],
                entrance_exams: ["Entrance Exam (Aufnahmeprüfung)"],
                english_tests: ["IELTS", "TOEFL"], // Though mostly German taught for BSc
                minimum_scores: { ielts: 7.0, toefl: 100 },
                tuition_fee_annual: 1600, // Very low fees
                living_cost_annual: 24000, // High living cost
                application_fee: 150,
                scholarships_available: true,
                scholarships: [{ name: "Excellence Scholarship", amount: "Living & Study costs", criteria: "Top 2% grade" }],
                visa_type: "Residence Permit",
                application_deadlines: { fall: "2025-04-30" },
                application_portal_url: "https://www.ethz.ch/en/studies",
                required_documents: ["CV", "Matriculation Certificate", "Language proficiency"],
                badges: ["Low Tuition", "Innovation"]
            },
            {
                name: "University of Toronto",
                country: "Canada",
                city: "Toronto",
                continent: "North America",
                university_type: "Public",
                description: "Founded in 1827, the University of Toronto has evolved into Canada's leading institution of learning, discovery and knowledge creation.",
                official_website: "https://www.utoronto.ca",
                global_ranking: 21,
                ranking_body: "QS",
                acceptance_rate: 43,
                restart_score: 9.3,
                degrees_offered: ["BSc Computer Science", "BASc Engineering"],
                entrance_exams: [],
                english_tests: ["IELTS", "TOEFL"],
                minimum_scores: { sat: 1350, ielts: 6.5, toefl: 100 },
                tuition_fee_annual: 48000,
                living_cost_annual: 15000,
                application_fee: 125,
                scholarships_available: true,
                scholarships: [{ name: "Lester B. Pearson Scholarship", amount: "Full Ride", criteria: "Leadership & Academic" }],
                visa_type: "Study Permit",
                application_deadlines: { fall: "2025-01-15" },
                application_portal_url: "https://future.utoronto.ca/apply",
                required_documents: ["Transcripts", "English Test Scores"],
                badges: ["Top in Canada", "Research"]
            },
            {
                name: "University of Melbourne",
                country: "Australia",
                city: "Melbourne",
                continent: "Occupied Oceania", // "Australia" usually
                university_type: "Public",
                description: "The University of Melbourne is a public-spirited institution that makes distinctive contributions to society in research, learning and teaching and engagement.",
                official_website: "https://www.unimelb.edu.au",
                global_ranking: 14,
                ranking_body: "QS",
                acceptance_rate: 70, // Higher for intl if criteria met
                restart_score: 9.1,
                degrees_offered: ["Bachelor of Science", "Bachelor of Design"],
                entrance_exams: [],
                english_tests: ["IELTS", "TOEFL", "PTE"],
                minimum_scores: { sat: 1320, ielts: 6.5, toefl: 79 },
                tuition_fee_annual: 32000,
                living_cost_annual: 18000,
                application_fee: 100,
                scholarships_available: true,
                scholarships: [{ name: "Melbourne International Undergraduate Scholarship", amount: "Up to 100% fee remission", criteria: "Merit" }],
                visa_type: "Student Visa (Subclass 500)",
                application_deadlines: { fall: "2025-06-30" }, // Semester 2
                application_portal_url: "https://study.unimelb.edu.au",
                required_documents: ["Academic Transcripts", "Passport"],
                badges: ["Top in Australia", "Urban Campus"]
            },
            {
                name: "Technical University of Munich (TUM)",
                country: "Germany",
                city: "Munich",
                continent: "Europe",
                university_type: "Public",
                description: "TUM is one of Europe's top universities. It is committed to excellence in research and teaching, interdisciplinary education and the active promotion of promising young scientists.",
                official_website: "https://www.tum.de",
                global_ranking: 37,
                ranking_body: "QS",
                acceptance_rate: 8,
                restart_score: 9.2,
                degrees_offered: ["B.Sc. Informatics", "B.Sc. Management & Technology"],
                entrance_exams: [],
                english_tests: ["IELTS", "TOEFL"],
                minimum_scores: { ielts: 6.5, toefl: 88 },
                tuition_fee_annual: 0, // No tuition typically, just semester fees, but recent changes for non-EU. Put ~3000 for realistic non-EU fees per sem * 2
                living_cost_annual: 13000,
                application_fee: 50,
                scholarships_available: true,
                scholarships: [{ name: "Deutschlandstipendium", amount: "300 EUR/month", criteria: "Talent" }],
                visa_type: "Student Visa",
                application_deadlines: { fall: "2025-07-15" },
                application_portal_url: "https://campus.tum.de",
                required_documents: ["APS Certificate", "CV", "Motivation Letter", "Transcripts"],
                badges: ["Free Tuition", "Engineering Giant"]
            },
            {
                name: "Imperial College London",
                country: "UK",
                city: "London",
                continent: "Europe",
                university_type: "Public",
                description: "Imperial College London is a world-class university with a mission to benefit society through excellence in science, engineering, medicine and business.",
                official_website: "https://www.imperial.ac.uk",
                global_ranking: 6,
                ranking_body: "QS",
                acceptance_rate: 14,
                restart_score: 9.6,
                degrees_offered: ["MEng Computing", "BEng Mechanical Engineering"],
                entrance_exams: [],
                english_tests: ["IELTS"],
                minimum_scores: { ielts: 7.0, toefl: 100 },
                tuition_fee_annual: 46000,
                living_cost_annual: 18000,
                application_fee: 30,
                scholarships_available: true,
                scholarships: [{ name: "President's Undergraduate Scholarship", amount: "Full tuition", criteria: "Academic excellence" }],
                visa_type: "Tier 4",
                application_deadlines: { fall: "2025-01-15" },
                application_portal_url: "https://www.ucas.com",
                required_documents: ["Personal Statement", "Reference"],
                badges: ["STEM Focused", "Central London"]
            },
            {
                name: "California Institute of Technology (Caltech)",
                country: "USA",
                city: "Pasadena",
                continent: "North America",
                university_type: "Private",
                description: "Caltech is a world-renowned science and engineering institute that marshals some of the world's brightest minds and most innovative tools to address fundamental scientific questions.",
                official_website: "https://www.caltech.edu",
                global_ranking: 15, // Varies by list
                ranking_body: "QS",
                acceptance_rate: 3,
                restart_score: 9.9,
                degrees_offered: ["B.S. Physics", "B.S. Computer Science"],
                entrance_exams: ["SAT", "ACT"], // Test blind recently but adding for completeness/legacy
                english_tests: ["TOEFL"],
                minimum_scores: { sat: 1530, act: 35, toefl: 100 },
                tuition_fee_annual: 60000,
                living_cost_annual: 22000,
                application_fee: 75,
                scholarships_available: true,
                scholarships: [{ name: "Caltech Scholarship", amount: "Need-based", criteria: "Demonstrated need" }],
                visa_type: "F1",
                application_deadlines: { fall: "2025-01-03" },
                application_portal_url: "https://www.commonapp.org",
                required_documents: ["Teacher Evaluations", "Transcripts", "Secondary School Report"],
                badges: ["Research Heavy", "Elite"]
            }
        ];

        // Inserting data
        console.log(`Seeding ${colleges.length} International Colleges...`);
        await InternationalCollege.insertMany(colleges);
        console.log('Seed complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedInternationalColleges();
