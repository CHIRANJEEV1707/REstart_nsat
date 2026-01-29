import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const QuestionSchema = new mongoose.Schema({
    mockTestId: mongoose.Schema.Types.ObjectId,
    section: String,
    questionNumber: Number
});

const MockTestSchema = new mongoose.Schema({
    title: String,
    slug: String,
    sections: []
});

const Question = mongoose.model('Question', QuestionSchema);
const MockTest = mongoose.model('MockTest', MockTestSchema);

// Define the correct section order
const SECTION_ORDER = [
    'Math (Class 10)',
    'Math (11-12)',
    'Language Reasoning',
    'Logic & Data Interpretation',
    'Algorithmic Thinking'
];

async function fixQuestionNumbers() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all mocks
    const mocks = await MockTest.find({});
    console.log(`Found ${mocks.length} mocks`);

    for (const mock of mocks) {
        console.log(`\nProcessing: ${mock.title}`);

        // Get all questions for this mock
        const questions = await Question.find({ mockTestId: mock._id });
        console.log(`  Total questions: ${questions.length}`);

        if (questions.length === 0) continue;

        // Group by section
        const sectionQuestions = {};
        for (const q of questions) {
            if (!sectionQuestions[q.section]) sectionQuestions[q.section] = [];
            sectionQuestions[q.section].push(q);
        }

        // Renumber sequentially following section order
        let globalNumber = 1;

        for (const sectionName of SECTION_ORDER) {
            if (!sectionQuestions[sectionName]) continue;

            const sqs = sectionQuestions[sectionName];
            console.log(`  ${sectionName}: ${sqs.length} questions -> starting at ${globalNumber}`);

            for (let i = 0; i < sqs.length; i++) {
                await Question.updateOne(
                    { _id: sqs[i]._id },
                    { $set: { questionNumber: globalNumber + i } }
                );
            }
            globalNumber += sqs.length;
        }

        // Handle any sections not in the order list
        for (const [section, sqs] of Object.entries(sectionQuestions)) {
            if (!SECTION_ORDER.includes(section)) {
                console.log(`  ${section} (extra): ${sqs.length} questions -> starting at ${globalNumber}`);
                for (let i = 0; i < sqs.length; i++) {
                    await Question.updateOne(
                        { _id: sqs[i]._id },
                        { $set: { questionNumber: globalNumber + i } }
                    );
                }
                globalNumber += sqs.length;
            }
        }

        console.log(`  ✅ Renumbered ${globalNumber - 1} questions`);
    }

    console.log('\n🎉 Done!');
    process.exit(0);
}

fixQuestionNumbers().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
