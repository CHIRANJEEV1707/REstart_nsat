'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Search, Calendar, Clock, Award, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ResultsHistoryPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

    useEffect(() => {
        fetch('/api/mock-tests/attempts')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAttempts(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Filter and Sort
    const filteredAttempts = attempts
        .filter(a => a.mockTestId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
            } else {
                return b.percentage - a.percentage;
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/prep/nsat" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to NSAT Prep
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Performance History</h1>
                            <p className="text-gray-600">Track your mock test results and progress over time.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Tests Taken</div>
                                    <div className="text-xl font-bold text-gray-900">{attempts.length}</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Avg. Score</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {attempts.length > 0
                                            ? Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / attempts.length)
                                            : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Sort by:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                        >
                            <option value="date">Most Recent</option>
                            <option value="score">Hightest Score</option>
                        </select>
                    </div>
                </div>

                {filteredAttempts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-500 mb-6">You haven&apos;t taken any mock tests yet, or none match your search.</p>
                        <Link href="/prep/nsat/mock-tests">
                            <Button>Explore Mock Tests</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredAttempts.map((attempt) => (
                            <div key={attempt._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                            {attempt.mockTestId?.title || 'Unknown Test'}
                                        </h3>
                                        {/* Status Badge */}
                                        <Badge variant="outline" className={attempt.percentage >= 70 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
                                            {attempt.percentage >= 70 ? 'Great' : 'Needs Work'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(attempt.completedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {Math.round((attempt.totalTimeSpent || 0) / 60)} mins
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 font-medium mb-1">Score</div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {attempt.totalScore} <span className="text-gray-400 text-sm font-normal">/ {attempt.maxScore}</span>
                                        </div>
                                    </div>

                                    <div className="text-center hidden sm:block">
                                        <div className="text-xs text-gray-500 font-medium mb-1">Accuracy</div>
                                        <div className={`text-xl font-bold ${(attempt.analytics?.accuracy || 0) >= 80 ? 'text-green-600' : 'text-indigo-600'}`}>
                                            {Math.round(attempt.analytics?.accuracy || 0)}%
                                        </div>
                                    </div>

                                    <Link href={`/prep/nsat/mock-tests/results/${attempt._id}`}>
                                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                            View Report
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

