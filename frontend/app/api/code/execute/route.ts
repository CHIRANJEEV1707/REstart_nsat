import { NextRequest, NextResponse } from 'next/server';

// Piston API for code execution (free, no API key needed)
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

// Language mappings for Piston
const LANGUAGE_CONFIG: Record<string, { language: string; version: string }> = {
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'java': { language: 'java', version: '15.0.2' },
    'cpp': { language: 'cpp', version: '10.2.0' },
    'c': { language: 'c', version: '10.2.0' }
};

interface ExecuteRequest {
    code: string;
    language: string;
    input?: string;
}

interface TestCaseResult {
    testCaseIndex: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
    executionTime?: number;
}

export async function POST(request: NextRequest) {
    try {
        const { code, language, input, testCases } = await request.json();

        // Validate language
        const langConfig = LANGUAGE_CONFIG[language.toLowerCase()];
        if (!langConfig) {
            return NextResponse.json(
                { success: false, message: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // If running against test cases
        if (testCases && Array.isArray(testCases)) {
            const results: TestCaseResult[] = [];
            let passedCount = 0;

            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const startTime = Date.now();

                try {
                    const response = await fetch(PISTON_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            language: langConfig.language,
                            version: langConfig.version,
                            files: [{ content: code }],
                            stdin: tc.input
                        })
                    });

                    const data = await response.json();
                    const executionTime = Date.now() - startTime;

                    const actualOutput = (data.run?.stdout || '').trim();
                    const expectedOutput = tc.expectedOutput.trim();
                    const error = data.run?.stderr || data.compile?.stderr || '';
                    const passed = actualOutput === expectedOutput && !error;

                    if (passed) passedCount++;

                    results.push({
                        testCaseIndex: i,
                        passed,
                        input: tc.isHidden ? 'Hidden' : tc.input,
                        expectedOutput: tc.isHidden ? 'Hidden' : expectedOutput,
                        actualOutput: tc.isHidden ? (passed ? 'Correct' : 'Incorrect') : actualOutput,
                        error: error || undefined,
                        executionTime
                    });
                } catch (err: any) {
                    results.push({
                        testCaseIndex: i,
                        passed: false,
                        input: tc.isHidden ? 'Hidden' : tc.input,
                        expectedOutput: tc.isHidden ? 'Hidden' : tc.expectedOutput,
                        actualOutput: '',
                        error: err.message
                    });
                }
            }

            return NextResponse.json({
                success: true,
                data: {
                    passedCount,
                    totalCount: testCases.length,
                    allPassed: passedCount === testCases.length,
                    results
                }
            });
        }

        // Single execution (Run button)
        const response = await fetch(PISTON_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files: [{ content: code }],
                stdin: input || ''
            })
        });

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data: {
                stdout: data.run?.stdout || '',
                stderr: data.run?.stderr || '',
                compileOutput: data.compile?.output || '',
                exitCode: data.run?.code ?? -1
            }
        });

    } catch (error: any) {
        console.error('[Code Execute Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Code execution failed' },
            { status: 500 }
        );
    }
}
