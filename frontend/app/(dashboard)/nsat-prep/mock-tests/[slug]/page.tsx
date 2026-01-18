'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowLeft, ArrowRight, Clock, AlertTriangle,
    Maximize, Camera, Bookmark, RotateCcw, Save, Menu, Play, Send
} from 'lucide-react';
import { ProctoringProvider, useProctoring } from '@/components/proctoring/ProctoringProvider';
import { CameraPreview } from '@/components/proctoring/CameraPreview';
import { ViolationWarning } from '@/components/proctoring/ViolationWarning';
import LanguageSelector from '@/components/coding/LanguageSelector';
import TestCasePanel from '@/components/coding/TestCasePanel';
import toast, { Toaster } from 'react-hot-toast';

// Dynamic import for Monaco to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/coding/CodeEditor'), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">Loading Editor...</div>
});

// Types
interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface Question {
    _id: string;
    section: string;
    questionNumber: number;
    questionText: string;
    questionType: 'mcq' | 'coding' | 'subjective';
    options: { id: string; text: string }[];
    marks: number;
    negativeMarks: number;
    isCoding?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
    constraints?: string;
    codeTemplate?: { language: string; template: string }[];
    testCases?: TestCase[];
}

// Default code templates
const DEFAULT_TEMPLATES: Record<string, string> = {
    python: `# Write your code here\n\ndef solution():\n    pass\n`,
    javascript: `// Write your code here\n\nfunction solution() {\n    \n}\n`,
    java: `// Write your code here\n\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
    cpp: `// Write your code here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n`
};

type QuestionStatus = 'not-visited' | 'visited' | 'answered' | 'marked-for-review' | 'answered-marked-for-review';

function TestInterface({ onAttemptIdChange }: { onAttemptIdChange?: (id: string | null) => void }) {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const proctoring = useProctoring();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [questionStatus, setQuestionStatus] = useState<{ [key: string]: QuestionStatus }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showViolation, setShowViolation] = useState<{ type: string; count: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
    const [testStartedAt, setTestStartedAt] = useState<Date | null>(null); // Track actual start time

    // Coding-specific state
    const [codingLanguage, setCodingLanguage] = useState<{ [qId: string]: string }>({});
    const [codeContent, setCodeContent] = useState<{ [qId: string]: string }>({});
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [testResults, setTestResults] = useState<{ [qId: string]: any }>({});
    const [activeIOTab, setActiveIOTab] = useState<'input' | 'output' | 'error'>('input');
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState({ stdout: '', stderr: '' });
    const [submittedQuestions, setSubmittedQuestions] = useState<{ [qId: string]: boolean }>({}); // Track locked questions

    // Notify parent when attemptId changes (for violation syncing)
    useEffect(() => {
        onAttemptIdChange?.(attemptId);
    }, [attemptId, onAttemptIdChange]);

    // Fetch test details (metadata)
    const { data: testData } = useQuery({
        queryKey: ['mockTest', slug],
        queryFn: async () => {
            const res = await api.get(`/mock-tests?slug=${slug}`);
            return res.data?.data?.[0];
        },
        enabled: !!slug
    });

    const [questions, setQuestions] = useState<Question[]>([]);

    // Determine current section
    const currentQuestion = questions[currentIndex];
    const currentSection = currentQuestion?.section || '';

    // Group questions by section
    const sections = useMemo(() => {
        const map = new Map<string, Question[]>();
        questions.forEach(q => {
            if (!map.has(q.section)) map.set(q.section, []);
            map.get(q.section)?.push(q);
        });
        return Array.from(map.entries());
    }, [questions]);

    // Start/Resume Mutation
    const startMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/mock-tests/${slug}/start`, {
                cameraEnabled: proctoring.cameraEnabled
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                setAttemptId(data.data.attempt._id);
                setQuestions(data.data.questions);

                // Initialize state from attempt (for resume)
                const existingAnswers: any = {};
                const existingStatus: any = {};
                const existingSubmitted: any = {};

                data.data.attempt.answers.forEach((ans: any) => {
                    existingAnswers[ans.questionId] = ans.selectedAnswer;
                    existingStatus[ans.questionId] = ans.status || 'not-visited';
                    if (ans.isVerified) {
                        existingSubmitted[ans.questionId] = true;
                    }
                });

                setAnswers(existingAnswers);
                setQuestionStatus(existingStatus);
                setSubmittedQuestions(existingSubmitted);

                // Calculate time left based on startedAt (Wall Clock Time)
                // This ensures timer resumes correctly even on refresh
                const startedAt = new Date(data.data.attempt.startedAt).getTime();
                const now = new Date().getTime();
                const durationMs = data.data.test.duration * 60 * 1000;

                // Time elapsed since start
                const elapsedMs = now - startedAt;
                const remainingSeconds = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));

                setTimeLeft(remainingSeconds);

                // Store the startedAt time for accurate time calculation
                setTestStartedAt(new Date(data.data.attempt.startedAt));

                setTestStarted(true);
                // proctoring.enterFullscreen(); // Only enter if not already? Or just force it.
                // Note: Removing auto-fullscreen on resume might be nicer, but let's keep it for security.
                if (remainingSeconds > 0) proctoring.enterFullscreen();
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.requiresPurchase) {
                toast.error('Premium access required');
                router.push('/nsat-prep');
            } else {
                toast.error('Failed to start test');
            }
        }
    });

    // Sync answer/status to backend
    const syncAnswer = useCallback(async (qId: string, ans: string, status: QuestionStatus, isVerified?: boolean) => {
        if (!attemptId) return;
        try {
            await api.post(`/mock-tests/attempts/${attemptId}/save-answer`, {
                questionId: qId,
                selectedAnswer: ans,
                status: status,
                timeSpent: 0, // Ideally track per question time
                isVerified
            });
        } catch (e) {
            console.error('Failed to sync answer', e);
        }
    }, [attemptId]);

    // Actions
    const handleOptionSelect = (qId: string, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
        // Auto-save: mark as answered immediately
        handleStatusUpdate(qId, 'answered');
        syncAnswer(qId, val, 'answered');
    };

    const handleStatusUpdate = (qId: string, newStatus: QuestionStatus) => {
        setQuestionStatus(prev => ({ ...prev, [qId]: newStatus }));
        // syncAnswer is called in handleOptionSelect for answers, 
        // but for other status updates (mark for review), we call it here.
        // However, to avoid double calling for option select if we call syncAnswer there,
        // we should be careful. 
        // Let's rely on handleOptionSelect calling syncAnswer separately for value changes.
        // For simple status changes (like clear/mark review) we call syncAnswer from those handlers or usage.

        // Actually, let's keep it simple: syncAnswer whenever status changes?
        // But status update doesn't have the answer value if called generically.
        // So we will trigger sync from the specific actions.
    };

    const handleSaveNext = () => {
        if (!currentQuestion) return;
        const ans = answers[currentQuestion._id];
        const newStatus = ans ? 'answered' : 'visited'; // If no answer, just visited (skipped)

        handleStatusUpdate(currentQuestion._id, newStatus);
        syncAnswer(currentQuestion._id, ans || '', newStatus);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleMarkReview = () => {
        if (!currentQuestion) return;
        const ans = answers[currentQuestion._id];
        const newStatus = ans ? 'answered-marked-for-review' : 'marked-for-review';

        handleStatusUpdate(currentQuestion._id, newStatus);
        syncAnswer(currentQuestion._id, ans || '', newStatus);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleClearResponse = () => {
        if (!currentQuestion) return;
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentQuestion._id];
            return next;
        });
        handleStatusUpdate(currentQuestion._id, 'visited');
        syncAnswer(currentQuestion._id, '', 'visited');
    };

    const jumpToQuestion = (idx: number) => {
        // Mark current as visited if moving away and status is not-visited
        if (currentQuestion && questionStatus[currentQuestion._id] === 'not-visited') {
            handleStatusUpdate(currentQuestion._id, 'visited');
        }
        setCurrentIndex(idx);
        setSidebarOpen(false);
    };

    // ===== Coding Handlers =====
    const getCurrentLanguage = (qId: string) => codingLanguage[qId] || 'python';

    const getCurrentCode = (qId: string, question: Question) => {
        if (codeContent[qId]) return codeContent[qId];
        const lang = getCurrentLanguage(qId);
        const template = question.codeTemplate?.find(t => t.language === lang)?.template;
        return template || DEFAULT_TEMPLATES[lang] || '';
    };

    const handleLanguageChange = (qId: string, newLang: string, question: Question) => {
        setCodingLanguage(prev => ({ ...prev, [qId]: newLang }));
        // Reset code to template for new language (only if user hasn't written code)
        if (!codeContent[qId] || codeContent[qId] === getCurrentCode(qId, question)) {
            const template = question.codeTemplate?.find(t => t.language === newLang)?.template;
            setCodeContent(prev => ({ ...prev, [qId]: template || DEFAULT_TEMPLATES[newLang] || '' }));
        }
    };

    const handleCodeChange = (qId: string, code: string) => {
        setCodeContent(prev => ({ ...prev, [qId]: code }));
        // Save code as answer for syncing
        setAnswers(prev => ({ ...prev, [qId]: code }));
        handleStatusUpdate(qId, 'answered');
    };

    const handleRunCode = async (question: Question) => {
        if (!question) return;
        const qId = question._id;
        const code = getCurrentCode(qId, question);
        const lang = getCurrentLanguage(qId);

        setIsRunningCode(true);
        setActiveIOTab('output');
        setRunOutput({ stdout: '', stderr: '' });

        try {
            const res = await api.post('/code/execute', {
                code,
                language: lang,
                input: customInput
            });

            if (res.data.success) {
                setRunOutput({
                    stdout: res.data.data.stdout,
                    stderr: res.data.data.stderr || res.data.data.compileOutput
                });
                if (res.data.data.stderr || res.data.data.compileOutput) {
                    setActiveIOTab('error');
                }
            }
        } catch (error: any) {
            setRunOutput({
                stdout: '',
                stderr: error.response?.data?.message || 'Execution failed'
            });
            setActiveIOTab('error');
        } finally {
            setIsRunningCode(false);
        }
    };

    const handleSubmitCode = async (question: Question) => {
        if (!question || !question.testCases) return;
        const qId = question._id;

        // Don't allow resubmission of already passed questions
        if (submittedQuestions[qId]) {
            toast.success('This question has already been submitted successfully!');
            return;
        }

        const code = getCurrentCode(qId, question);
        const lang = getCurrentLanguage(qId);

        setIsRunningCode(true);
        setTestResults(prev => ({ ...prev, [qId]: null }));

        try {
            const res = await api.post('/code/execute', {
                code,
                language: lang,
                testCases: question.testCases
            });

            if (res.data.success) {
                const results = res.data.data;
                setTestResults(prev => ({ ...prev, [qId]: results }));

                // Mark as answered
                handleStatusUpdate(qId, 'answered');

                // If all tests passed, lock the question
                if (results.allPassed) {
                    setSubmittedQuestions(prev => ({ ...prev, [qId]: true }));
                    syncAnswer(qId, code, 'answered', true);
                    toast.success('🎉 All test cases passed! Solution submitted successfully.');
                } else {
                    syncAnswer(qId, code, 'answered', false);
                    toast.error(`${results.passedCount}/${results.totalCount} test cases passed. Try again!`);
                }
            }
        } catch (error: any) {
            setTestResults(prev => ({
                ...prev,
                [qId]: {
                    passedCount: 0,
                    totalCount: question.testCases?.length || 0,
                    allPassed: false,
                    results: [{ error: error.message }]
                }
            }));
            toast.error('Execution failed: ' + (error.message || 'Unknown error'));
        } finally {
            setIsRunningCode(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (!testStarted) return;

        // If loaded with 0 time, submit immediately
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [testStarted, timeLeft]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Submit
    const handleSubmit = async () => {
        if (submitting || !attemptId) return;
        setSubmitting(true);
        try {
            // Calculate actual time spent from startedAt to now
            let actualTimeSpent = 0;
            if (testStartedAt) {
                actualTimeSpent = Math.floor((new Date().getTime() - testStartedAt.getTime()) / 1000);
            } else {
                // Fallback: use duration - timeLeft (less accurate)
                actualTimeSpent = (testData?.duration * 60 || 0) - timeLeft;
            }

            // Cap at test duration to avoid showing more than allowed time
            const maxDuration = (testData?.duration || 60) * 60;
            actualTimeSpent = Math.min(actualTimeSpent, maxDuration);

            await api.post(`/mock-tests/attempts/${attemptId}/submit`, {
                answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                    questionId,
                    selectedAnswer,
                    isVerified: !!submittedQuestions[questionId]
                })),
                totalTimeSpent: actualTimeSpent
            });
            proctoring.exitFullscreen();
            proctoring.disableCamera();
            router.push(`/nsat-prep/mock-tests/results/${attemptId}`);
        } catch (error) {
            toast.error('Failed to submit test');
            setSubmitting(false);
        }
    };

    // Pre-test Screen
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{testData?.title || 'Loading...'}</h1>
                    {testData && (
                        <>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium">{testData.duration} minutes</span>
                                </div>
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="text-gray-500">Total Marks</span>
                                    <span className="font-medium">{testData.totalMarks}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="text-gray-500">Total Questions</span>
                                    <span className="font-medium">{testData.sections?.reduce((a: any, b: any) => a + b.questionCount, 0) || 0}</span>
                                </div>
                            </div>

                            {/* Proctoring Info */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Proctoring Enabled
                                </h3>
                                <ul className="text-sm text-amber-700 space-y-1 ml-6 list-disc">
                                    <li>Camera monitoring active</li>
                                    <li>Fullscreen mandatory</li>
                                    <li>Tab switching tracked</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => proctoring.enableCamera()}
                                    variant={proctoring.cameraEnabled ? 'default' : 'outline'}
                                    className={`w-full ${proctoring.cameraEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    {proctoring.cameraEnabled ? 'Camera Connected' : 'Connect Camera'}
                                </Button>

                                <Button
                                    onClick={() => startMutation.mutate()}
                                    disabled={!proctoring.cameraEnabled || startMutation.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    size="lg"
                                >
                                    <Maximize className="w-4 h-4 mr-2" />
                                    {startMutation.isPending ? 'Starting Test...' : 'Start Test Now'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Main Interface
    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-gray-800 truncate max-w-[200px] lg:max-w-md" title={testData?.title}>
                        {testData?.title}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-900'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>

                    <Button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                    >
                        <Menu />
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                    {/* Violation & Camera */}
                    {showViolation && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full">
                            <ViolationWarning
                                type={showViolation.type as any}
                                count={showViolation.count}
                                onDismiss={() => setShowViolation(null)}
                                onReEnterFullscreen={proctoring.enterFullscreen}
                            />
                        </div>
                    )}
                    <div className="absolute top-4 right-4 z-10 w-32 opacity-80 hover:opacity-100 transition-opacity">
                        <CameraPreview />
                    </div>

                    {/* Question Header - Only show for MCQ, coding has it in split view */}
                    {currentQuestion?.questionType !== 'coding' && (
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    {currentSection}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <h2 className="text-xl font-bold text-gray-900">Question {currentIndex + 1}</h2>
                                    <Badge variant="outline">MCQ</Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">+{currentQuestion?.marks} Marks</div>
                                <div className="text-sm text-red-500">-{currentQuestion?.negativeMarks} Neg.</div>
                            </div>
                        </div>
                    )}

                    {/* Question Body */}
                    {currentQuestion?.questionType === 'coding' ? (
                        /* ===== CODING QUESTION: FULL-HEIGHT SPLIT VIEW ===== */
                        <div className="flex-1 flex overflow-hidden">
                            {/* LEFT PANEL: Question Description */}
                            <div className="w-[40%] border-r border-gray-200 overflow-y-auto bg-white">
                                <div className="p-6">
                                    {/* Question Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                {currentSection}
                                            </span>
                                            <Badge className={`${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {currentQuestion.difficulty || 'Medium'}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-green-600">+{currentQuestion.marks}</span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            <span className="text-sm text-red-500">-{currentQuestion.negativeMarks}</span>
                                        </div>
                                    </div>

                                    {/* Question Title */}
                                    <h1 className="text-xl font-bold text-gray-900 mb-4">
                                        Question {currentIndex + 1}: {currentQuestion.questionText.split('\n')[0]}
                                    </h1>

                                    {/* Problem Description */}
                                    <div className="prose prose-sm max-w-none mb-6">
                                        <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed bg-transparent p-0 m-0 border-0">
                                            {currentQuestion.questionText.split('\n').slice(1).join('\n').trim()}
                                        </pre>
                                    </div>

                                    {/* Constraints */}
                                    {currentQuestion.constraints && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Constraints</h3>
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <pre className="text-sm text-amber-800 whitespace-pre-wrap font-mono">
                                                    {currentQuestion.constraints}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sample Test Cases - Only show non-hidden */}
                                    {currentQuestion.testCases && currentQuestion.testCases.filter(tc => !tc.isHidden).length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Examples</h3>
                                            {currentQuestion.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
                                                    <div className="mb-3">
                                                        <div className="text-xs font-medium text-gray-500 mb-1">Input:</div>
                                                        <pre className="text-sm text-gray-800 bg-white p-2 rounded border font-mono overflow-x-auto">
                                                            {tc.input || '(empty)'}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 mb-1">Expected Output:</div>
                                                        <pre className="text-sm text-gray-800 bg-white p-2 rounded border font-mono overflow-x-auto">
                                                            {tc.expectedOutput}
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Submission Results - Show summary only */}
                                    {testResults[currentQuestion._id] && (
                                        <div className="mt-6">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-3">Submission Result</h3>
                                            <div className={`p-4 rounded-lg border ${testResults[currentQuestion._id].allPassed
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-lg font-bold ${testResults[currentQuestion._id].allPassed ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {testResults[currentQuestion._id].allPassed ? '✓ Accepted' : '✗ Wrong Answer'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {testResults[currentQuestion._id].passedCount}/{testResults[currentQuestion._id].totalCount} test cases passed
                                                </p>

                                                {/* Individual Test Case Results */}
                                                <div className="space-y-2">
                                                    {testResults[currentQuestion._id].results?.map((result: any, idx: number) => (
                                                        <div key={idx} className={`flex items-center gap-2 text-sm ${result.passed ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {result.passed ? (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            <span>
                                                                Test Case {idx + 1}: {result.input === 'Hidden' ? '(Hidden)' : result.passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT PANEL: Code Editor */}
                            <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative">
                                {/* Locked Overlay for submitted questions */}
                                {submittedQuestions[currentQuestion._id] && (
                                    <div className="absolute inset-0 z-20 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-8 text-center">
                                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <h3 className="text-xl font-bold text-green-400 mb-2">Solution Accepted!</h3>
                                            <p className="text-gray-400 text-sm">All test cases passed. This question has been submitted.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Editor Header */}
                                <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <LanguageSelector
                                            value={getCurrentLanguage(currentQuestion._id)}
                                            onChange={(lang) => handleLanguageChange(currentQuestion._id, lang, currentQuestion)}
                                        />
                                        {submittedQuestions[currentQuestion._id] && (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                                ✓ Submitted
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => handleRunCode(currentQuestion)}
                                            disabled={isRunningCode || submittedQuestions[currentQuestion._id]}
                                            size="sm"
                                            variant="outline"
                                            className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            {isRunningCode ? 'Running...' : 'Run'}
                                        </Button>
                                        <Button
                                            onClick={() => handleSubmitCode(currentQuestion)}
                                            disabled={isRunningCode || submittedQuestions[currentQuestion._id]}
                                            size="sm"
                                            className={`${submittedQuestions[currentQuestion._id]
                                                ? 'bg-green-700 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                                } text-white`}
                                        >
                                            <Send className="w-4 h-4 mr-1" />
                                            {submittedQuestions[currentQuestion._id] ? 'Submitted' : 'Submit'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Code Editor - Use calc for explicit height */}
                                <div style={{ height: 'calc(100vh - 16rem - 48px - 160px)' }} className="min-h-[250px]">
                                    <CodeEditor
                                        language={getCurrentLanguage(currentQuestion._id)}
                                        value={getCurrentCode(currentQuestion._id, currentQuestion)}
                                        onChange={(code) => !submittedQuestions[currentQuestion._id] && handleCodeChange(currentQuestion._id, code)}
                                        height="100%"
                                    />
                                </div>


                                {/* I/O Panel */}
                                <div className="h-40 border-t border-gray-700 flex flex-col shrink-0">
                                    <div className="flex border-b border-gray-700 bg-gray-800">
                                        {(['input', 'output', 'error'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveIOTab(tab)}
                                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeIOTab === tab
                                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                                    : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                            >
                                                {tab.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex-1 p-3 overflow-auto bg-gray-900">
                                        {activeIOTab === 'input' && (
                                            <textarea
                                                value={customInput}
                                                onChange={(e) => setCustomInput(e.target.value)}
                                                placeholder="Enter custom input here..."
                                                className="w-full h-full bg-transparent text-gray-300 text-sm focus:outline-none resize-none font-mono"
                                            />
                                        )}
                                        {activeIOTab === 'output' && (
                                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                                {isRunningCode ? 'Running...' : (runOutput.stdout || 'Click "Run" to execute your code')}
                                            </pre>
                                        )}
                                        {activeIOTab === 'error' && (
                                            <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">
                                                {runOutput.stderr || 'No errors'}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ===== MCQ QUESTION: Regular layout ===== */
                        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                            <div className="max-w-4xl mx-auto">
                                {/* Question Header for MCQ */}
                                <div className="bg-white border-b px-6 py-4 flex items-center justify-between mb-6 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 rounded-t-lg">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {currentSection}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <h2 className="text-xl font-bold text-gray-900">Question {currentIndex + 1}</h2>
                                            <Badge variant="outline">MCQ</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">+{currentQuestion?.marks} Marks</div>
                                        <div className="text-sm text-red-500">-{currentQuestion?.negativeMarks} Neg.</div>
                                    </div>
                                </div>

                                <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap mb-8 font-medium">
                                    {currentQuestion?.questionText}
                                </p>

                                <div className="space-y-3">
                                    {currentQuestion?.options.map((option) => (
                                        <div
                                            key={option.id}
                                            onClick={() => handleOptionSelect(currentQuestion._id, option.id)}
                                            className={`group relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${answers[currentQuestion._id] === option.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${answers[currentQuestion._id] === option.id
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-gray-300 group-hover:border-blue-400'
                                                }`}>
                                                {answers[currentQuestion._id] === option.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className={`flex-1 font-medium ${answers[currentQuestion._id] === option.id ? 'text-blue-900' : 'text-gray-700'
                                                }`}>
                                                {option.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Footer Controls */}
                    <div className="bg-white border-t p-4 flex items-center justify-between gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleMarkReview}
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                                <Bookmark className="w-4 h-4 mr-2" />
                                Mark for Review
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleClearResponse}
                                className="text-gray-500 hover:text-red-600"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>

                        <Button
                            onClick={handleSaveNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        >
                            {currentIndex === questions.length - 1 ? 'Save' : 'Save & Next'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </main>

                {/* Right Sidebar (Palette) */}
                <aside className={`fixed inset-y-0 right-0 w-80 bg-white border-l shadow-2xl transform transition-transform duration-300 z-30 lg:relative lg:transform-none lg:shadow-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}>
                    <div className="flex flex-col h-full">
                        {/* User Profile / Info */}
                        <div className="p-6 border-b bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    U
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Candidate</div>
                                    <div className="text-xs text-gray-500">ID: {attemptId?.substring(0, 8)}...</div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Answered
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Not Answered
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Review
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gray-200"></span> Not Visited
                                </div>
                            </div>
                        </div>

                        {/* Question Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {sections.map(([sectionName, sectionQuestions]) => (
                                <div key={sectionName} className="mb-6">
                                    <h3 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider sticky top-0 bg-white py-2 z-10 border-b">
                                        {sectionName}
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {sectionQuestions.map((q) => {
                                            const status = questionStatus[q._id] || 'not-visited';
                                            const isCurrent = currentQuestion?._id === q._id;

                                            // Determine styles based on status
                                            let bgClass = 'bg-gray-100 text-gray-600 border-gray-200'; // Default not-visited

                                            if (status === 'answered') bgClass = 'bg-green-100 text-green-700 border-green-300';
                                            else if (status === 'visited') bgClass = 'bg-red-50 text-red-600 border-red-200'; // Visited but not answered
                                            else if (status === 'marked-for-review') bgClass = 'bg-purple-100 text-purple-700 border-purple-300';
                                            else if (status === 'answered-marked-for-review') bgClass = 'bg-purple-100 text-purple-700 border-green-500 ring-1 ring-green-500';

                                            if (isCurrent) bgClass += ' ring-2 ring-blue-500 ring-offset-1';

                                            return (
                                                <button
                                                    key={q._id}
                                                    onClick={() => jumpToQuestion(questions.findIndex(qt => qt._id === q._id))}
                                                    className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium border transition-all ${bgClass}`}
                                                >
                                                    {q.questionNumber}
                                                    {status === 'answered-marked-for-review' && (
                                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="p-4 border-t bg-gray-50">
                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                size="lg"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Test'}
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default function MockTestPage() {
    const [attemptIdForViolation, setAttemptIdForViolation] = useState<string | null>(null);

    // Sync violation to backend
    const handleViolation = useCallback(async (type: string) => {
        if (!attemptIdForViolation) return;
        try {
            await api.post(`/mock-tests/attempts/${attemptIdForViolation}/violation`, { type });
            console.log(`[Proctoring] Violation synced: ${type}`);
        } catch (e) {
            console.error('Failed to sync violation', e);
        }
    }, [attemptIdForViolation]);

    return (
        <ProctoringProvider onViolation={handleViolation}>
            <TestInterfaceWrapper setAttemptIdForViolation={setAttemptIdForViolation} />
        </ProctoringProvider>
    );
}

// Wrapper to pass attemptId up to parent for violation syncing
function TestInterfaceWrapper({ setAttemptIdForViolation }: { setAttemptIdForViolation: (id: string | null) => void }) {
    return <TestInterface onAttemptIdChange={setAttemptIdForViolation} />;
}
