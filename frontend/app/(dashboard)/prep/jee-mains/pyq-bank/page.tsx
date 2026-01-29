'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, BookOpen, FlaskConical, Calculator, Atom, Play, Settings, Sparkles } from 'lucide-react';

interface SubjectStats {
    subject: string;
    count: number;
    chaptersCount: number;
    yearsRange: { min: number; max: number };
}

interface BankStats {
    total: number;
    bySubject: SubjectStats[];
}

const subjectIcons: Record<string, any> = {
    Mathematics: Calculator,
    Physics: Atom,
    Chemistry: FlaskConical
};

const subjectColors: Record<string, string> = {
    Mathematics: 'from-blue-500 to-indigo-600',
    Physics: 'from-orange-500 to-red-600',
    Chemistry: 'from-green-500 to-emerald-600'
};

export default function PYQBankPage() {
    const router = useRouter();
    const [isGeneratingMock, setIsGeneratingMock] = useState(false);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['jeeBankStats'],
        queryFn: async () => {
            const res = await api.get('/jee-bank/stats');
            return res.data?.data as BankStats;
        }
    });

    const handleGenerateMock = async () => {
        setIsGeneratingMock(true);
        try {
            const res = await api.post('/jee-bank/generate-mock');
            const mock = res.data?.data;
            // Store mock in sessionStorage and navigate
            sessionStorage.setItem('pyqMock', JSON.stringify(mock));
            router.push('/prep/jee-mains/pyq-bank/mock');
        } catch (error) {
            console.error('Failed to generate mock:', error);
        } finally {
            setIsGeneratingMock(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Link href="/prep/jee-mains" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to JEE Mains Prep
                </Link>

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">JEE Mains PYQ Bank</h1>
                                <p className="text-white/80">Top 500 Previous Year Questions per Subject</p>
                            </div>
                        </div>

                        {stats && (
                            <div className="flex gap-6 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <span className="text-2xl font-bold">{stats.total}</span>
                                    <span className="text-white/70 ml-2">Total Questions</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <span className="text-2xl font-bold">3</span>
                                    <span className="text-white/70 ml-2">Subjects</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <button
                        onClick={handleGenerateMock}
                        disabled={isGeneratingMock}
                        className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-xl hover:border-indigo-300 transition-all disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Play className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Start PYQ Mock Test</h3>
                                <p className="text-gray-600 text-sm">30 questions × 3 subjects • Attempt 25 per section</p>
                                <p className="text-gray-500 text-xs mt-1">3 hours • 300 marks • JEE pattern</p>
                            </div>
                        </div>
                        <Sparkles className="absolute right-4 top-4 w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <Link href="/prep/jee-mains/pyq-bank/practice" className="group">
                        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-green-300 transition-all h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Settings className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Custom Practice</h3>
                                    <p className="text-gray-600 text-sm">Choose subject, chapter & question count</p>
                                    <p className="text-gray-500 text-xs mt-1">Flexible practice mode</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Subject Cards */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Subject</h2>

                {isLoading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {stats?.bySubject.map((subject) => {
                            const Icon = subjectIcons[subject.subject] || BookOpen;
                            const gradient = subjectColors[subject.subject] || 'from-gray-500 to-gray-600';

                            return (
                                <Link
                                    key={subject.subject}
                                    href={`/prep/jee-mains/pyq-bank/${subject.subject.toLowerCase()}`}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                                        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}>
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{subject.subject}</h3>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Questions</span>
                                                <span className="font-semibold text-gray-900">{subject.count}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Chapters</span>
                                                <span className="font-semibold text-gray-900">{subject.chaptersCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Years</span>
                                                <span className="font-semibold text-gray-900">{subject.yearsRange.min} - {subject.yearsRange.max}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                                                View Questions →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
