'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Clock, BarChart2, ChevronRight, Play } from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/Badge';

export default function PYQPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;
    const [activeTab, setActiveTab] = useState<'years' | 'topics'>('years');
    const [yearsData, setYearsData] = useState<{ [key: string]: any[] }>({});
    const [topicsData, setTopicsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPractice, setLoadingPractice] = useState<string | null>(null);

    const examTitle = examId.toUpperCase().replace('-', ' ');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'years') {
                    const res = await axios.get(`/api/pyq/${examId}/years`);
                    if (res.data.success) {
                        setYearsData(res.data.data);
                    }
                } else {
                    const res = await axios.get(`/api/pyq/${examId}/chapters`);
                    if (res.data.success) {
                        setTopicsData(res.data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch PYQ data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, examId]);

    const handleStartPractice = async (subject: string, chapter: string) => {
        setLoadingPractice(`${subject}-${chapter}`);
        try {
            const res = await axios.post(`/api/pyq/${examId}/generate`, {
                subject,
                chapter,
                count: 10 // Default to 10 questions
            });

            if (res.data.success) {
                router.push(`/nsat-prep/mock-tests/${res.data.data.slug}`);
            }
        } catch (error) {
            console.error('Failed to start practice', error);
        } finally {
            setLoadingPractice(null);
        }
    };

    const handleStartTest = (testSlug: string) => {
        router.push(`/nsat-prep/mock-tests/${testSlug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Link href={`/prep/${examId}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {examTitle} Prep
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Questions</h1>
                    <p className="text-gray-600">Practice with official papers from past years or focus on specific topics.</p>

                    {/* Tabs */}
                    <div className="flex space-x-6 mt-8">
                        <button
                            onClick={() => setActiveTab('years')}
                            className={`pb-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'years'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Year-wise Papers
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('topics')}
                            className={`pb-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'topics'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <BarChart2 className="w-4 h-4" /> Topic-wise Practice
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Year-wise View */}
                        {activeTab === 'years' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {Object.keys(yearsData).length === 0 ? (
                                    <EmptyState message="No previous year papers found yet." />
                                ) : (
                                    Object.keys(yearsData).sort((a, b) => Number(b) - Number(a)).map((year) => (
                                        <div key={year}>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <Calendar className="w-5 h-5 mr-2 text-gray-400" /> {year}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {yearsData[year].map((paper: any) => (
                                                    <div
                                                        key={paper._id}
                                                        className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
                                                        onClick={() => handleStartTest(paper.slug)}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-105 transition-transform">
                                                                <BookOpen className="w-6 h-6" />
                                                            </div>
                                                            {paper.shift && (
                                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                                    {paper.shift}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                            {paper.title}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" /> {paper.duration}m
                                                            </span>
                                                            <span>•</span>
                                                            <span>{paper.questionCount} Questions</span>
                                                            <span>•</span>
                                                            <span>{paper.totalMarks} Marks</span>
                                                        </div>
                                                        <button className="w-full py-2.5 bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all flex items-center justify-center">
                                                            Start Paper <Play className="w-4 h-4 ml-2 fill-current" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Topic-wise View */}
                        {activeTab === 'topics' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {topicsData.length === 0 ? (
                                    <div className="col-span-2">
                                        <EmptyState message="No topic-wise data available yet." />
                                    </div>
                                ) : (
                                    topicsData.map((subject) => (
                                        <div key={subject.subject} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                                <h3 className="text-xl font-bold text-gray-900">{subject.subject}</h3>
                                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                                                    {subject.totalQuestions} Questions
                                                </Badge>
                                            </div>
                                            <div className="p-2">
                                                {subject.chapters.map((chapter: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg group transition-colors"
                                                    >
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{chapter.name}</h4>
                                                            <p className="text-sm text-gray-500">{chapter.count} questions</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleStartPractice(subject.subject, chapter.name)}
                                                            disabled={loadingPractice === `${subject.subject}-${chapter.name}`}
                                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {loadingPractice === `${subject.subject}-${chapter.name}` ? (
                                                                <span className="animate-spin mr-2">⟳</span>
                                                            ) : (
                                                                <Play className="w-4 h-4 mr-1.5 fill-current" />
                                                            )}
                                                            Practice
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{message}</p>
        </div>
    );
}
