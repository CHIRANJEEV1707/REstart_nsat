
const fs = require('fs');
const path = require('path');

const docsPath = path.resolve(__dirname, '../docs');
console.log('Current __dirname:', __dirname);
console.log('Resolving path to:', docsPath);

if (fs.existsSync(docsPath)) {
    console.log('Docs folder found. Files:');
    console.log(fs.readdirSync(docsPath));
} else {
    console.log('Docs folder NOT found at', docsPath);
    // Try scanning parent recursively?
    console.log('Parent dir contents:', fs.readdirSync(path.join(__dirname, '..')));
}
