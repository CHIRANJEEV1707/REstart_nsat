import fs from 'fs/promises';
import path from 'path';

// CONFIGURATION
const API_KEY = process.env.GEMINI_API_KEY;
const MOCK_COUNT = 8; // Generate Mocks 3 to 10
const START_MOCK_NUM = 3;
const SOURCE_FILE = './docs/mocktestsgeneral/deepseek_json_20260121_0d1def (1).json';
const OUTPUT_DIR = './docs/generated_mocks';

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is not set.');
    console.error('Usage: GEMINI_API_KEY=your_key_here node scripts/generate_mocks_gemini.mjs');
    process.exit(1);
}

// Helper to delay (avoid rate limits)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) {
                const err = await response.text();
                if (response.status === 503 || response.status === 429) {
                    console.warn(`⚠️ Attempt ${i + 1} failed (Overloaded/RateLimit): ${response.status}. Retrying...`);
                    const waitTime = Math.pow(2, i) * 1000 + (Math.random() * 1000); // Exponential backoff
                    await delay(waitTime);
                    continue;
                }
                throw new Error(`API Error: ${response.status} - ${err}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return JSON.parse(text);
        } catch (err) {
            console.warn(`⚠️ Attempt ${i + 1} failed: ${err.message}`);
            if (i === maxRetries - 1) throw err;
            await delay(5000 * (i + 1));
        }
    }
}

async function generateMock(mockNum, seedMock) {
    console.log(`\n🚀 Generating Mock ${mockNum}...`);

    const newMock = {
        title: `NSAT General Mock ${mockNum}`,
        slug: `nsat-general-mock-${mockNum}`,
        examType: "nsat_general",
        duration: 180,
        totalMarks: 300,
        sections: seedMock.sections,
        questions: []
    };

    // Generate questions section by section
    for (const section of seedMock.sections) {
        console.log(`   - Generating ${section.name} (${section.questionCount} questions)...`);

        // Find detailed example questions from seed mock for this section
        const seedQuestions = seedMock.questions.filter(q => q.section === section.name).slice(0, 3);
        const seedJsonLimit = JSON.stringify(seedQuestions);

        const prompt = `
            You are an expert exam setter for the NSAT (Newton School Aptitude Test).
            
            Task: Generate ${section.questionCount} NEW questions for the section "${section.name}".
            
            Requirements:
            1. Difficulty: Mixed (Easy, Medium, Hard).
            2. Topics: Similar to the example questions below but vary the numbers, values, and scenarios.
            3. Structure: STRICTLY follow the JSON structure of the examples.
            4. Output: Return ONLY a JSON array of ${section.questionCount} question objects.
            
            Example Format (Use this Schema):
            ${seedJsonLimit}
            
            Key Rules:
            - "section" must be "${section.name}"
            - "questionNumber" should start from ${newMock.questions.length + 1}
            - "options" must be an array of objects with "id" and "text"
        `;

        try {
            const newQuestions = await callGemini(prompt);

            // Fix numbering just in case
            let currentNum = newMock.questions.length + 1;
            newQuestions.forEach(q => {
                q.questionNumber = currentNum++;
                q.section = section.name; // Ensure section matches
            });

            newMock.questions.push(...newQuestions);
            await delay(1000); // Rate limit buffer
        } catch (err) {
            console.error(`   ❌ Failed to generate section ${section.name}:`, err.message);
        }
    }

    return newMock;
}

async function main() {
    try {
        const targetMockNum = process.argv[2] ? parseInt(process.argv[2]) : null;

        console.log('Reading seed mock...');
        const seedData = await fs.readFile(SOURCE_FILE, 'utf-8');
        const seedMock = JSON.parse(seedData);

        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        if (targetMockNum) {
            // Generate ONLY the specified mock
            console.log(`🎯 Generating ONLY Mock ${targetMockNum}`);
            const mock = await generateMock(targetMockNum, seedMock);
            const fileName = `nsat_general_mock_${targetMockNum}.json`;
            const filePath = path.join(OUTPUT_DIR, fileName);
            await fs.writeFile(filePath, JSON.stringify(mock, null, 2));
            console.log(`✅ Saved ${fileName}`);
        } else {
            // Original loop logic (fallback)
            for (let i = START_MOCK_NUM; i < START_MOCK_NUM + MOCK_COUNT; i++) {
                const fileName = `nsat_general_mock_${i}.json`;
                const filePath = path.join(OUTPUT_DIR, fileName);

                try {
                    await fs.access(filePath);
                    console.log(`\n⏭️  Skipping ${fileName} (already exists)`);
                    continue;
                } catch (e) {
                    // File does not exist
                }

                const mock = await generateMock(i, seedMock);
                await fs.writeFile(filePath, JSON.stringify(mock, null, 2));
                console.log(`✅ Saved ${fileName}`);
            }
        }

        console.log('\n✨ Done!');
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

main();
