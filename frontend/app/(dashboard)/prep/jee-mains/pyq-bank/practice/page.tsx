'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Play, Clock, Hash, BookOpen, Calculator, Atom, FlaskConical } from 'lucide-react';

const subjects = [
    { id: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-indigo-600' },
    { id: 'Physics', icon: Atom, color: 'from-orange-500 to-red-600' },
    { id: 'Chemistry', icon: FlaskConical, color: 'from-green-500 to-emerald-600' }
];

export default function PracticeSetupPage() {
    const router = useRouter();
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [questionCount, setQuestionCount] = useState(20);
    const [timeLimit, setTimeLimit] = useState(30); // minutes
    const [isStarting, setIsStarting] = useState(false);

    // Fetch chapters
    const { data: chaptersData } = useQuery({
        queryKey: ['jeeChapters'],
        queryFn: async () => {
            const res = await api.get('/jee-bank/chapters');
            return res.data?.data;
        }
    });

    const chapters = chaptersData?.[selectedSubject] || [];

    const handleStart = async () => {
        setIsStarting(true);
        try {
            const res = await api.post('/jee-bank/practice', {
                subject: selectedSubject,
                chapter: selectedChapter || undefined,
                count: questionCount,
                random: true
            });

            const practiceSession = {
                ...res.data?.data,
                timeLimit: timeLimit * 60, // convert to seconds
                startedAt: new Date().toISOString()
            };

            sessionStorage.setItem('pyqPractice', JSON.stringify(practiceSession));
            router.push('/prep/jee-mains/pyq-bank/mock?mode=practice');
        } catch (error) {
            console.error('Failed to start practice:', error);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20">
            <div className="max-w-2xl mx-auto px-6 py-8">
                <Link href="/prep/jee-mains/pyq-bank" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to PYQ Bank
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Practice</h1>
                    <p className="text-gray-600">Configure your practice session</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Subject
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {subjects.map((subj) => {
                                const Icon = subj.icon;
                                const isSelected = selectedSubject === subj.id;
                                return (
                                    <button
                                        key={subj.id}
                                        onClick={() => { setSelectedSubject(subj.id); setSelectedChapter(''); }}
                                        className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${subj.color} rounded-lg flex items-center justify-center text-white`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                                            {subj.id}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chapter Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Chapter (Optional)
                        </label>
                        <select
                            value={selectedChapter}
                            onChange={(e) => setSelectedChapter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Chapters</option>
                            {chapters.map((ch: any) => (
                                <option key={ch.name} value={ch.name}>
                                    {ch.name} ({ch.count} questions)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Question Count */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Hash className="w-4 h-4 inline mr-1" />
                            Number of Questions
                        </label>
                        <div className="flex gap-3">
                            {[10, 20, 30, 50].map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setQuestionCount(count)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${questionCount === count
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Time Limit (minutes)
                        </label>
                        <div className="flex gap-3">
                            {[15, 30, 45, 60].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setTimeLimit(time)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${timeLimit === time
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {time} min
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Session Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Subject:</span>
                                <span className="ml-2 font-medium text-gray-900">{selectedSubject}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Chapter:</span>
                                <span className="ml-2 font-medium text-gray-900">{selectedChapter || 'All'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Questions:</span>
                                <span className="ml-2 font-medium text-gray-900">{questionCount}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Time:</span>
                                <span className="ml-2 font-medium text-gray-900">{timeLimit} minutes</span>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <Button
                        onClick={handleStart}
                        disabled={isStarting}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        {isStarting ? 'Starting...' : 'Start Practice'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
