
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

function log(msg: string) {
    const logPath = path.join(__dirname, '../../audit_output.txt');
    try {
        fs.appendFileSync(logPath, msg + '\n');
    } catch (e) {
        // Fallback if we can't write to file
    }
    console.log(msg);
}

log('Script started');
const DOCS_DIR = path.join(__dirname, '../../../docs');

async function auditDocs() {
    log(`Scanning directory: ${DOCS_DIR}`);
    if (!fs.existsSync(DOCS_DIR)) {
        log('Docs directory not found!');
        return;
    }

    const files = fs.readdirSync(DOCS_DIR);
    let totalQuestions = 0;

    log('\n--- Audit Report ---\n');

    for (const file of files) {
        const filePath = path.join(DOCS_DIR, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) continue;

        if (file.endsWith('.json')) {
            await auditJson(file, filePath);
        } else if (file.endsWith('.pdf')) {
            await auditPdf(file, filePath);
        }
    }

    log(`\n--------------------`);
    log(`Total Potential Questions Found (Approx): ${totalQuestions}`);
}

async function auditJson(fileName: string, filePath: string) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        let count = 0;

        if (data.pages && Array.isArray(data.pages)) {
            data.pages.forEach((page: any) => {
                if (page.content && Array.isArray(page.content)) {
                    page.content.forEach((item: any) => {
                        if (item.text && /^\s*\d+\.\s*$/.test(item.text)) {
                            count++;
                        }
                    });
                }
            });
        }

        log(`[JSON] ${fileName}: ~${count} questions found.`);
    } catch (e) {
        log(`[JSON] Error parsing ${fileName}: ${e}`);
    }
}

async function auditPdf(fileName: string, filePath: string) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;

        const qMatches = (text.match(/(?:^|\n)\s*\d+\.\s+/g) || []).length;
        const qWordMatches = (text.match(/(?:^|\n)\s*Question\s*\d+/gi) || []).length;

        const count = Math.max(qMatches, qWordMatches);

        log(`[PDF]  ${fileName}: ~${count} questions regex-matched. (Title guess: ${fileName.replace('.pdf', '')})`);
    } catch (e) {
        log(`[PDF]  Error parsing ${fileName}: ${e}`);
    }
}

auditDocs().catch(e => log(String(e)));
