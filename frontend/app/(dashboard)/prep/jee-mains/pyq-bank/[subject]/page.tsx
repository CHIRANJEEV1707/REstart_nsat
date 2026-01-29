'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ChevronDown, ChevronUp, Filter, BookOpen, Calculator, Atom, FlaskConical } from 'lucide-react';
import { formatMath } from '@/lib/formatMath';

interface Question {
    _id: string;
    questionNumber: number;
    chapter: string;
    year: number;
    shift: string;
    questionText: string;
    options: { id: string; text: string }[];
    isInteger: boolean;
    difficulty: string;
}

const subjectTitles: Record<string, string> = {
    mathematics: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry'
};

const subjectIcons: Record<string, any> = {
    mathematics: Calculator,
    physics: Atom,
    chemistry: FlaskConical
};

export default function SubjectQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const subject = params.subject as string;
    const subjectTitle = subjectTitles[subject] || subject;
    const Icon = subjectIcons[subject] || BookOpen;

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [page, setPage] = useState(0);
    const limit = 20;

    // Fetch chapters
    const { data: chaptersData } = useQuery({
        queryKey: ['jeeChapters'],
        queryFn: async () => {
            const res = await api.get('/jee-bank/chapters');
            return res.data?.data;
        }
    });

    const chapters = chaptersData?.[subjectTitle] || [];

    // Fetch questions
    const { data, isLoading } = useQuery({
        queryKey: ['jeeQuestions', subject, selectedChapter, page],
        queryFn: async () => {
            const params: any = {
                subject: subjectTitle,
                limit,
                skip: page * limit
            };
            if (selectedChapter) params.chapter = selectedChapter;
            const res = await api.get('/jee-bank/questions', { params });
            return res.data;
        }
    });

    const questions: Question[] = data?.data || [];
    const total = data?.pagination?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Link href="/prep/jee-mains/pyq-bank" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to PYQ Bank
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{subjectTitle} PYQs</h1>
                        <p className="text-gray-500">{total} questions • {chapters.length} chapters</p>
                    </div>
                </div>

                {/* Chapter Filter */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter by Chapter</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { setSelectedChapter(''); setPage(0); }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedChapter
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Chapters
                        </button>
                        {chapters.slice(0, 10).map((ch: any) => (
                            <button
                                key={ch.name}
                                onClick={() => { setSelectedChapter(ch.name); setPage(0); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedChapter === ch.name
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {ch.name} ({ch.count})
                            </button>
                        ))}
                        {chapters.length > 10 && (
                            <span className="px-3 py-1.5 text-sm text-gray-500">
                                +{chapters.length - 10} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Questions List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q) => (
                            <div key={q._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => toggleExpand(q._id)}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            Q{q.questionNumber}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900 pr-8 line-clamp-2" dangerouslySetInnerHTML={{ __html: formatMath(q.questionText) }} />
                                                <div className="text-gray-400 flex-shrink-0">
                                                    {expandedId === q._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-xs">{q.year}</Badge>
                                                <Badge variant="secondary" className="text-xs bg-gray-100">{q.chapter}</Badge>
                                                {q.isInteger && <Badge className="text-xs bg-purple-100 text-purple-700">Integer</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Options */}
                                {expandedId === q._id && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 pl-20">
                                        {q.options.length > 0 ? (
                                            <div className="space-y-2">
                                                {q.options.map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        className="p-3 rounded-lg border bg-white border-gray-200 text-gray-700 text-sm"
                                                    >
                                                        <span className="font-bold mr-2">({opt.id})</span>
                                                        <span dangerouslySetInnerHTML={{ __html: formatMath(opt.text) }} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">This is an integer-type question. Enter your numerical answer.</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-3">JEE Main {q.year} • {q.shift}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-600">
                            Page {page + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
