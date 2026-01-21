const https = require('https');
const fs = require('fs');

https.get('https://emkc.org/api/v2/piston/runtimes', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('runtimes.json', data);
        console.log('Runtimes saved to runtimes.json');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
