'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface PYQQuestion {
    _id: string;
    questionNumber: number;
    section: string;
    questionText: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    difficulty: string;
}

export default function PYQQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;

    // Manage expanded state for questions (accordion)
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['pyqQuestions', categoryId],
        queryFn: async () => {
            try {
                const res = await api.get(`/pyqs/${categoryId}/questions`);
                return res.data;
            } catch (err: any) {
                if (err.response?.status === 403) {
                    throw new Error('PREMIUM_REQUIRED');
                }
                throw err;
            }
        },
        retry: false
    });

    if (error) {
        if (error.message === 'PREMIUM_REQUIRED') {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Access Required</h2>
                    <p className="text-gray-500 mb-6 max-w-md">This content is available only for premium members. Upgrade your plan to access all Previous Year Questions.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        <Button onClick={() => router.push('/prep/nsat')} className="bg-blue-600 hover:bg-blue-700 text-white">View Plans</Button>
                    </div>
                </div>
            );
        }
        return <div className="p-8 text-center text-red-500">Failed to load questions. Please try again.</div>;
    }

    const questions: PYQQuestion[] = data?.data || [];
    const category = data?.category;

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to PYQs
                </Button>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary">{category?.year}</Badge>
                                <Badge variant="outline">{category?.examType === 'nsat' ? 'NSAT General' : 'Coding NSAT'}</Badge>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{category?.title}</h1>
                            <p className="text-gray-600">{category?.description}</p>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q) => (
                                <div key={q._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div
                                        className="p-5 cursor-pointer flex gap-4"
                                        onClick={() => toggleExpand(q._id)}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {q.questionNumber}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900 pr-8">{q.questionText}</p>
                                                <div className="text-gray-400">
                                                    {expandedId === q._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{q.section}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content (Options & Answer) */}
                                    {expandedId === q._id && (
                                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 pl-16">
                                            <div className="space-y-2 mb-4">
                                                {q.options.map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        className={`p-3 rounded-lg border text-sm ${opt.id === q.correctAnswer
                                                            ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                                                            : 'bg-white border-gray-200 text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span>
                                                        {opt.text}
                                                        {opt.id === q.correctAnswer && <span className="ml-2 text-green-600 text-xs font-bold">(Correct Answer)</span>}
                                                    </div>
                                                ))}
                                            </div>

                                            {q.explanation && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
                                                    <span className="font-bold block mb-1">Explanation:</span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
