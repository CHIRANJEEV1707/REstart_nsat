const fetch = require('node-fetch'); // Assuming node-fetch or native fetch in node 18+

async function test() {
    console.log('Testing Piston...');
    try {
        const res = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'python',
                version: '3.10.0',
                files: [{ content: 'print("Piston Works")' }]
            })
        });
        console.log('Piston Status:', res.status);
        const txt = await res.text();
        console.log('Piston Body:', txt);
    } catch (e) {
        console.error('Piston Error:', e.message);
    }

    console.log('Testing Local API...');
    try {
        const res = await fetch('http://localhost:3001/api/code/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'print("Local Works")',
                language: 'python'
            })
        });
        console.log('Local Status:', res.status);
        const txt = await res.text();
        console.log('Local Body:', txt);
    } catch (e) {
        console.error('Local Error:', e.message);
    }
}

test();
