'use client';

import { CheckCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';

interface TestCaseResult {
    testCaseIndex: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
    executionTime?: number;
}

interface TestCasePanelProps {
    results: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    isLoading?: boolean;
}

export default function TestCasePanel({ results, passedCount, totalCount, isLoading }: TestCasePanelProps) {
    if (isLoading) {
        return (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Running test cases...
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-500 text-sm">Run your code to see test case results</p>
            </div>
        );
    }

    const allPassed = passedCount === totalCount;

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {allPassed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
                        {passedCount}/{totalCount} Test Cases Passed
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${allPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {allPassed ? 'Accepted' : 'Wrong Answer'}
                </span>
            </div>

            {/* Test Cases List */}
            <div className="divide-y divide-gray-800">
                {results.map((tc, idx) => (
                    <div key={idx} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {tc.passed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-gray-300 font-medium">TC #{idx}</span>
                                {tc.input === 'Hidden' && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <EyeOff className="w-3 h-3" /> Hidden
                                    </span>
                                )}
                            </div>
                            {tc.executionTime && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {tc.executionTime}ms
                                </div>
                            )}
                        </div>

                        {tc.input !== 'Hidden' && (
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Input</div>
                                    <pre className="text-xs bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                                        {tc.input || '(empty)'}
                                    </pre>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Expected</div>
                                    <pre className="text-xs bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                                        {tc.expectedOutput}
                                    </pre>
                                </div>
                                {!tc.passed && tc.actualOutput && (
                                    <div className="col-span-2">
                                        <div className="text-xs text-gray-500 mb-1">Your Output</div>
                                        <pre className="text-xs bg-red-900/30 p-2 rounded text-red-300 overflow-x-auto border border-red-800">
                                            {tc.actualOutput}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {tc.error && (
                            <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">Error</div>
                                <pre className="text-xs bg-red-900/30 p-2 rounded text-red-300 overflow-x-auto border border-red-800">
                                    {tc.error}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
