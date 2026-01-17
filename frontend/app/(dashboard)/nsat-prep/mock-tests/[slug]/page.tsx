'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ArrowRight, Clock, AlertTriangle, Check, X, Maximize, Camera } from 'lucide-react';
import { ProctoringProvider, useProctoring } from '@/components/proctoring/ProctoringProvider';
import { CameraPreview } from '@/components/proctoring/CameraPreview';
import { ViolationWarning } from '@/components/proctoring/ViolationWarning';
import toast, { Toaster } from 'react-hot-toast';

interface Question {
    _id: string;
    section: string;
    questionNumber: number;
    questionText: string;
    questionType: string;
    options: { id: string; text: string }[];
    marks: number;
    negativeMarks: number;
}

function TestInterface() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const proctoring = useProctoring();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showViolation, setShowViolation] = useState<{ type: string; count: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch test data
    const { data: testData, isLoading } = useQuery({
        queryKey: ['mockTest', slug],
        queryFn: async () => {
            const res = await api.get(`/mock-tests?slug=${slug}`);
            return res.data?.data?.[0];
        },
        enabled: !!slug
    });

    const [questions, setQuestions] = useState<Question[]>([]);

    // Start test mutation
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
                setQuestions(data.data.questions); // Use legitimate questions from API
                setTimeLeft(data.data.test.duration * 60);
                setTestStarted(true);
                proctoring.enterFullscreen();
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

    // Format time
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer
    useEffect(() => {
        if (!testStarted || timeLeft <= 0) return;

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
    }, [testStarted, timeLeft]); // Added timeLeft dependency to avoid stale closure? No, setter uses functional update. But added for correctness.

    // Handle violation callback
    const handleViolation = useCallback((type: string) => {
        setShowViolation({ type, count: proctoring.totalViolations + 1 });

        // Send violation to backend
        if (attemptId) {
            api.post(`/mock-tests/attempts/${attemptId}/violation`, { type }).catch(console.error);
        }
    }, [attemptId, proctoring.totalViolations]);

    // Handle answer selection
    const handleAnswer = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));

        // Auto-save to backend
        if (attemptId) {
            api.post(`/mock-tests/attempts/${attemptId}/save-answer`, {
                questionId,
                selectedAnswer: optionId,
                timeSpent: 0
            }).catch(console.error);
        }
    };

    // Submit test
    const handleSubmit = async () => {
        if (submitting || !attemptId) return;
        setSubmitting(true);

        try {
            const res = await api.post(`/mock-tests/attempts/${attemptId}/submit`, {
                answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                    questionId,
                    selectedAnswer
                })),
                totalTimeSpent: (testData?.duration * 60 || 0) - timeLeft
            });

            if (res.data.success) {
                proctoring.exitFullscreen();
                proctoring.disableCamera();
                router.push(`/nsat-prep/mock-tests/results/${attemptId}`);
            }
        } catch (error) {
            toast.error('Failed to submit test');
            setSubmitting(false);
        }
    };

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    // Pre-test screen
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{testData?.title || 'Loading...'}</h1>

                    {testData && (
                        <>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium">{testData.duration} minutes</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Marks</span>
                                    <span className="font-medium">{testData.totalMarks}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sections</span>
                                    <span className="font-medium">{testData.sections?.length || 0}</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Proctoring Enabled
                                </h3>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• Camera will be monitored</li>
                                    <li>• Tab switches will be recorded</li>
                                    <li>• Fullscreen mode is required</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => proctoring.enableCamera()}
                                    variant={proctoring.cameraEnabled ? 'default' : 'outline'}
                                    className="w-full"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    {proctoring.cameraEnabled ? '✓ Camera Enabled' : 'Enable Camera'}
                                </Button>

                                <Button
                                    onClick={() => startMutation.mutate()}
                                    disabled={!proctoring.cameraEnabled || startMutation.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Maximize className="w-4 h-4 mr-2" />
                                    {startMutation.isPending ? 'Starting...' : 'Start Test (Fullscreen)'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-right" />

            {/* Violation Warning */}
            {showViolation && (
                <ViolationWarning
                    type={showViolation.type as any}
                    count={showViolation.count}
                    onDismiss={() => setShowViolation(null)}
                    onReEnterFullscreen={proctoring.enterFullscreen}
                />
            )}

            {/* Camera Preview */}
            <CameraPreview />

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-gray-900">{testData?.title}</h1>
                        <Badge variant="secondary">
                            {currentQuestion?.section || 'Section'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Violation Counter */}
                        {proctoring.totalViolations > 0 && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {proctoring.totalViolations} violations
                            </div>
                        )}

                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-900'}`}>
                            <Clock className="w-5 h-5" />
                            {formatTime(timeLeft)}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                    {/* Question Number */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            Q{currentIndex + 1} of {totalQuestions}
                        </span>
                        <span className="text-sm text-gray-500">
                            {currentQuestion?.marks} marks {currentQuestion?.negativeMarks > 0 && `(-${currentQuestion.negativeMarks} for wrong)`}
                        </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-lg text-gray-900 mb-8">
                        {currentQuestion?.questionText}
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion?.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(currentQuestion._id, option.id)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion._id] === option.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${answers[currentQuestion._id] === option.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {option.id.toUpperCase()}
                                    </div>
                                    <span>{option.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    {/* Question Palette */}
                    <div className="flex gap-1 flex-wrap max-w-md justify-center">
                        {questions.slice(0, 20).map((q, idx) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-8 h-8 rounded text-xs font-medium ${idx === currentIndex
                                    ? 'bg-blue-600 text-white'
                                    : answers[q._id]
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        {questions.length > 20 && (
                            <span className="text-gray-400 text-xs">+{questions.length - 20}</span>
                        )}
                    </div>

                    <Button
                        onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        disabled={currentIndex === totalQuestions - 1}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
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
