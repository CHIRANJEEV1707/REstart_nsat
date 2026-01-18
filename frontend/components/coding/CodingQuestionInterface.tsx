'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Play, Send, Clock, AlertCircle, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import CodeEditor from '@/components/coding/CodeEditor';
import LanguageSelector from '@/components/coding/LanguageSelector';
import TestCasePanel from '@/components/coding/TestCasePanel';
import api from '@/lib/axios';

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface CodingQuestion {
    _id: string;
    questionNumber: number;
    questionText: string;
    difficulty: 'easy' | 'medium' | 'hard';
    marks: number;
    constraints?: string;
    functionName?: string;
    codeTemplate: { language: string; template: string }[];
    testCases: TestCase[];
}

interface CodingQuestionInterfaceProps {
    question: CodingQuestion;
    onBack: () => void;
    onSubmit: (code: string, language: string, results: any) => void;
    timeLeft?: number;
}

const DEFAULT_TEMPLATES: Record<string, string> = {
    python: `def solution():
    # Your code here
    pass

# Read input and call your function
if __name__ == "__main__":
    solution()
`,
    javascript: `function solution() {
    // Your code here
}

// Read input and call your function
const input = require('fs').readFileSync(0, 'utf-8').trim();
console.log(solution(input));
`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}
`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}
`
};

export default function CodingQuestionInterface({
    question,
    onBack,
    onSubmit,
    timeLeft
}: CodingQuestionInterfaceProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(
        question.codeTemplate?.find(t => t.language === 'python')?.template ||
        DEFAULT_TEMPLATES['python']
    );
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'input' | 'output' | 'error'>('input');
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState({ stdout: '', stderr: '' });

    // Handle language change
    const handleLanguageChange = useCallback((newLang: string) => {
        setLanguage(newLang);
        const template = question.codeTemplate?.find(t => t.language === newLang)?.template;
        setCode(template || DEFAULT_TEMPLATES[newLang] || '');
    }, [question.codeTemplate]);

    // Run against custom input
    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('output');
        setRunOutput({ stdout: '', stderr: '' });

        try {
            const res = await api.post('/code/execute', {
                code,
                language,
                input: customInput
            });

            if (res.data.success) {
                setRunOutput({
                    stdout: res.data.data.stdout,
                    stderr: res.data.data.stderr || res.data.data.compileOutput
                });
                if (res.data.data.stderr || res.data.data.compileOutput) {
                    setActiveTab('error');
                }
            }
        } catch (error: any) {
            setRunOutput({
                stdout: '',
                stderr: error.response?.data?.message || 'Execution failed'
            });
            setActiveTab('error');
        } finally {
            setIsRunning(false);
        }
    };

    // Submit against all test cases
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setTestResults(null);

        try {
            const res = await api.post('/code/execute', {
                code,
                language,
                testCases: question.testCases
            });

            if (res.data.success) {
                setTestResults(res.data.data);
                onSubmit(code, language, res.data.data);
            }
        } catch (error: any) {
            setTestResults({
                passedCount: 0,
                totalCount: question.testCases.length,
                allPassed: false,
                results: [{ error: error.message }]
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const difficultyColors = {
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    // Get sample test cases (non-hidden)
    const sampleTestCases = question.testCases.filter(tc => !tc.isHidden);

    return (
        <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
            {/* Header */}
            <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold">Q{question.questionNumber}</span>
                        <Badge className={`${difficultyColors[question.difficulty]} border`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </Badge>
                        <span className="text-gray-400 text-sm">{question.marks} pts</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {timeLeft !== undefined && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono ${timeLeft < 300 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'
                            }`}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <Button
                        onClick={handleRun}
                        disabled={isRunning}
                        variant="outline"
                        className="border-gray-700 hover:bg-gray-800"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? 'Running...' : 'Run'}
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Question */}
                <div className="w-[45%] border-r border-gray-800 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Question Title */}
                        <h1 className="text-xl font-bold mb-4">{question.questionText.split('\n')[0]}</h1>

                        {/* Problem Description */}
                        <div className="prose prose-invert prose-sm max-w-none mb-6">
                            <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                                {question.questionText}
                            </pre>
                        </div>

                        {/* Constraints */}
                        {question.constraints && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Constraints
                                </h3>
                                <pre className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">
                                    {question.constraints}
                                </pre>
                            </div>
                        )}

                        {/* Sample Test Cases */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Examples</h3>
                            {sampleTestCases.map((tc, idx) => (
                                <div key={idx} className="bg-gray-900 rounded-lg p-4 mb-3 border border-gray-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Sample Input {idx + 1}:</div>
                                            <pre className="text-sm text-gray-300">{tc.input || '(no input)'}</pre>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Sample Output {idx + 1}:</div>
                                            <pre className="text-sm text-gray-300">{tc.expectedOutput}</pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Test Results (after submit) */}
                        {testResults && (
                            <TestCasePanel
                                results={testResults.results}
                                passedCount={testResults.passedCount}
                                totalCount={testResults.totalCount}
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel - Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Editor Header */}
                    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                        <LanguageSelector value={language} onChange={handleLanguageChange} />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Code className="w-4 h-4" />
                            Code Editor
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor
                            language={language}
                            value={code}
                            onChange={setCode}
                            height="100%"
                        />
                    </div>

                    {/* Bottom Panel - I/O */}
                    <div className="h-48 border-t border-gray-800 flex flex-col shrink-0">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            {(['input', 'output', 'error'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                            ? 'text-blue-400 border-b-2 border-blue-400'
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-3 overflow-auto">
                            {activeTab === 'input' && (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    className="w-full h-full bg-gray-900 text-gray-300 text-sm p-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 resize-none font-mono"
                                />
                            )}
                            {activeTab === 'output' && (
                                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                    {isRunning ? 'Running...' : (runOutput.stdout || 'No output')}
                                </pre>
                            )}
                            {activeTab === 'error' && (
                                <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">
                                    {runOutput.stderr || 'No errors'}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
