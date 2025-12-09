const http = require('http');

function makeRequest(method, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/signup',
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            console.log(`\n[${method}] Status: ${res.statusCode}`);
            console.log(`[${method}] Headers:`);
            console.log(JSON.stringify(res.headers, null, 2));

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ headers: res.headers, statusCode: res.statusCode }));
        });

        req.on('error', (e) => {
            console.error(`[${method}] Error: ${e.message}`);
            reject(e);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function start() {
    console.log('--- Debugging CORS ---');

    console.log('1. Testing OPTIONS...');
    await makeRequest('OPTIONS', {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
    });

    console.log('2. Testing POST...');
    await makeRequest('POST', {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
    }, JSON.stringify({
        name: 'Debug User',
        email: 'debug@example.com',
        password: 'password123',
        state: 'Delhi',
        class_level: '12th'
    }));
}

start();
