'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowLeft, ArrowRight, Clock, AlertTriangle,
    Maximize, Camera, Bookmark, RotateCcw, Save, Menu
} from 'lucide-react';
import { ProctoringProvider, useProctoring } from '@/components/proctoring/ProctoringProvider';
import { CameraPreview } from '@/components/proctoring/CameraPreview';
import { ViolationWarning } from '@/components/proctoring/ViolationWarning';
import toast, { Toaster } from 'react-hot-toast';

// Types
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
}

type QuestionStatus = 'not-visited' | 'visited' | 'answered' | 'marked-for-review' | 'answered-marked-for-review';

function TestInterface() {
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

                data.data.attempt.answers.forEach((ans: any) => {
                    existingAnswers[ans.questionId] = ans.selectedAnswer;
                    existingStatus[ans.questionId] = ans.status || 'not-visited';
                });

                setAnswers(existingAnswers);
                setQuestionStatus(existingStatus);

                // Calculate time left based on startedAt (Wall Clock Time)
                // This ensures timer resumes correctly even on refresh
                const startedAt = new Date(data.data.attempt.startedAt).getTime();
                const now = new Date().getTime();
                const durationMs = data.data.test.duration * 60 * 1000;

                // Time elapsed since start
                const elapsedMs = now - startedAt;
                const remainingSeconds = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));

                setTimeLeft(remainingSeconds);

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
    const syncAnswer = useCallback(async (qId: string, ans: string, status: QuestionStatus) => {
        if (!attemptId) return;
        try {
            await api.post(`/mock-tests/attempts/${attemptId}/save-answer`, {
                questionId: qId,
                selectedAnswer: ans,
                status: status,
                timeSpent: 0 // Ideally track per question time
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
            await api.post(`/mock-tests/attempts/${attemptId}/submit`, {
                answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                    questionId,
                    selectedAnswer
                })),
                totalTimeSpent: (testData?.duration * 60 || 0) - timeLeft
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

                    {/* Question Header */}
                    <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                        <div>
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {currentSection}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <h2 className="text-xl font-bold text-gray-900">Question {currentIndex + 1}</h2>
                                <Badge variant={currentQuestion?.questionType === 'coding' ? 'default' : 'outline'}>
                                    {currentQuestion?.questionType === 'coding' ? 'Coding' : 'MCQ'}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-green-600">+{currentQuestion?.marks} Marks</div>
                            <div className="text-sm text-red-500">-{currentQuestion?.negativeMarks} Neg.</div>
                        </div>
                    </div>

                    {/* Question Body */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap mb-8 font-medium">
                                {currentQuestion?.questionText}
                            </p>

                            {currentQuestion?.questionType === 'coding' ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                        <div className="bg-gray-800 px-4 py-2 text-gray-400 text-xs flex items-center justify-between">
                                            <span>Code Editor (Python/Java/C++)</span>
                                            <span>Auto-saved</span>
                                        </div>
                                        <textarea
                                            value={answers[currentQuestion._id] || ''}
                                            onChange={(e) => handleOptionSelect(currentQuestion._id, e.target.value)}
                                            className="w-full h-96 bg-gray-900 text-gray-100 font-mono p-4 focus:outline-none resize-none text-sm leading-6"
                                            placeholder="// Write your code here..."
                                            spellCheck={false}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        * Note: Syntax highlighting is limited in this view.
                                    </p>
                                </div>
                            ) : (
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
                            )}
                        </div>
                    </div>

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
    return (
        <ProctoringProvider>
            <TestInterface />
        </ProctoringProvider>
    );
}
