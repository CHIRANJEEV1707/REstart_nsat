const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load env from frontend/.env.local
const envPath = path.resolve(__dirname, '../frontend/.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1]] = match[2].trim();
        }
    }
}

const uri = process.env.MONGODB_URI;
const logPath = path.resolve(__dirname, 'db-check.txt');

async function run() {
    const log = [];

    try {
        log.push('URI: ' + (uri ? uri.substring(0, 50) + '...' : 'NOT FOUND'));
        await mongoose.connect(uri);
        log.push('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Check current mock tests
        const tests = await db.collection('mocktests').find({}).toArray();
        log.push(`\nFound ${tests.length} mock tests:`);

        tests.forEach(t => {
            log.push(`- ${t.title}: ${t.duration} mins, ${t.totalMarks} marks`);
        });

        fs.writeFileSync(logPath, log.join('\n'));
        console.log('Written to db-check.txt');

        await mongoose.disconnect();

    } catch (e) {
        log.push('Error: ' + e.message);
        fs.writeFileSync(logPath, log.join('\n'));
    }

    process.exit(0);
}

run();
