'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import { formatMath } from '@/lib/formatMath';

interface Question {
    _id: string;
    questionNumber: number;
    questionText: string;
    options: { id: string; text: string }[];
    isInteger: boolean;
    difficulty: string;
    chapter: string;
}

interface MockSection {
    name: string;
    questions: Question[];
    totalQuestions: number;
    toAttempt: number;
}

interface MockData {
    title: string;
    sections: MockSection[];
    duration: number;
    totalMarks: number;
}

export default function MockTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isPractice = searchParams.get('mode') === 'practice';

    const [mockData, setMockData] = useState<MockData | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Load mock data from sessionStorage
    useEffect(() => {
        const stored = isPractice
            ? sessionStorage.getItem('pyqPractice')
            : sessionStorage.getItem('pyqMock');

        if (stored) {
            const data = JSON.parse(stored);
            if (isPractice) {
                // Convert practice data to mock format
                setMockData({
                    title: `${data.subject} Practice`,
                    sections: [{
                        name: data.subject,
                        questions: data.questions,
                        totalQuestions: data.questions.length,
                        toAttempt: data.questions.length
                    }],
                    duration: data.timeLimit / 60,
                    totalMarks: data.questions.length * 4
                });
                setTimeLeft(data.timeLimit);
            } else {
                setMockData(data);
                setTimeLeft(data.duration * 60);
            }
        }
    }, [isPractice]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0 || isSubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleSubmit();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted]);

    if (!mockData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">No mock test data found</p>
                    <Link href="/prep/jee-mains/pyq-bank">
                        <Button>Go to PYQ Bank</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const section = mockData.sections[currentSection];
    const question = section?.questions[currentQuestion];
    const questionKey = `${currentSection}-${currentQuestion}`;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionKey]: optionId }));
    };

    const handleFlag = () => {
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(questionKey)) {
                next.delete(questionKey);
            } else {
                next.add(questionKey);
            }
            return next;
        });
    };

    const handleNext = () => {
        if (currentQuestion < section.questions.length - 1) {
            setCurrentQuestion(q => q + 1);
        } else if (currentSection < mockData.sections.length - 1) {
            setCurrentSection(s => s + 1);
            setCurrentQuestion(0);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(q => q - 1);
        } else if (currentSection > 0) {
            setCurrentSection(s => s - 1);
            setCurrentQuestion(mockData.sections[currentSection - 1].questions.length - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        // Calculate score (simplified - would need correct answers from API)
        const attempted = Object.keys(answers).length;
        alert(`Test Submitted!\nAttempted: ${attempted} questions`);
        router.push('/prep/jee-mains/pyq-bank');
    };

    const getQuestionStatus = (sIdx: number, qIdx: number) => {
        const key = `${sIdx}-${qIdx}`;
        if (answers[key]) return 'answered';
        if (flagged.has(key)) return 'flagged';
        return 'not-answered';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-gray-900">{mockData.title}</h1>
                    <Badge variant="outline">{section?.name}</Badge>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                    </div>
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                        Submit Test
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Question Panel */}
                <main className="flex-1 p-6">
                    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                    {currentQuestion + 1}
                                </span>
                                <Badge variant="outline">{question?.chapter}</Badge>
                            </div>
                            <button
                                onClick={handleFlag}
                                className={`p-2 rounded-lg transition-colors ${flagged.has(questionKey) ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Flag className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Question Text */}
                        <div className="mb-8">
                            <p className="text-lg text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMath(question?.questionText || '') }} />
                        </div>

                        {/* Options */}
                        {question?.options && question.options.length > 0 ? (
                            <div className="space-y-3">
                                {question.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleAnswer(opt.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${answers[questionKey] === opt.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="font-bold text-gray-500 mr-3">({opt.id})</span>
                                        <span dangerouslySetInnerHTML={{ __html: formatMath(opt.text) }} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enter your answer:</label>
                                <input
                                    type="text"
                                    value={answers[questionKey] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter numerical value"
                                />
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button variant="outline" onClick={handlePrev} disabled={currentSection === 0 && currentQuestion === 0}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                            </Button>
                            <Button variant="outline" onClick={handleNext}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </main>

                {/* Question Palette */}
                <aside className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                    <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>

                    {mockData.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="mb-6">
                            <p className="text-sm font-medium text-gray-600 mb-2">{sec.name}</p>
                            <div className="grid grid-cols-5 gap-2">
                                {sec.questions.map((_, qIdx) => {
                                    const status = getQuestionStatus(sIdx, qIdx);
                                    const isCurrent = sIdx === currentSection && qIdx === currentQuestion;
                                    return (
                                        <button
                                            key={qIdx}
                                            onClick={() => { setCurrentSection(sIdx); setCurrentQuestion(qIdx); }}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${isCurrent ? 'ring-2 ring-indigo-500' : ''
                                                } ${status === 'answered' ? 'bg-green-500 text-white' :
                                                    status === 'flagged' ? 'bg-orange-500 text-white' :
                                                        'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {qIdx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-green-500 rounded"></span>
                            <span className="text-gray-600">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-orange-500 rounded"></span>
                            <span className="text-gray-600">Flagged for Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-gray-100 rounded border"></span>
                            <span className="text-gray-600">Not Answered</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
