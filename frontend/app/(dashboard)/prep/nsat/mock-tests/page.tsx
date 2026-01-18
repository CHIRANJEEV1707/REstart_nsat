'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, FileText, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface MockTest {
    _id: string;
    title: string;
    slug: string;
    description: string;
    examType: 'nsat' | 'coding-nsat';
    duration: number;
    totalMarks: number;
    sections: { name: string; questionCount: number; marks: number }[];
    isFree: boolean;
    isPremium: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
}

export default function MockTestsPage() {
    const { user } = useAuth();
    const [accessLevel, setAccessLevel] = useState<'none' | 'free' | 'premium'>('none');

    // Fetch access status
    const { data: accessData, refetch: refetchAccess } = useQuery({
        queryKey: ['freePackStatus'],
        queryFn: async () => {
            const res = await api.get('/free-pack');
            return res.data?.data;
        },
        enabled: !!user
    });

    useEffect(() => {
        if (accessData) {
            setAccessLevel(accessData.accessLevel);
        }
    }, [accessData]);

    // Fetch mock tests
    const { data: testsData, isLoading } = useQuery({
        queryKey: ['mockTests'],
        queryFn: async () => {
            const res = await api.get('/mock-tests');
            return res.data?.data || [];
        }
    });

    // Claim free pack mutation
    const claimMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/free-pack', { source: 'mock-test-page' });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.alreadyClaimed) {
                toast.success('You already have the free pack!');
            } else {
                toast.success('🎉 Free pack claimed successfully!');
            }
            refetchAccess();
        },
        onError: () => {
            toast.error('Failed to claim free pack. Please try again.');
        }
    });

    const tests: MockTest[] = testsData || [];

    const canAccessTest = (test: MockTest) => {
        if (accessLevel === 'premium') return true;
        if (accessLevel === 'free' && test.isFree) return true;
        return false;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen pb-20 page-transition bg-gray-50/30">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/prep/nsat" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to NSAT Prep
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Tests</h1>
                    <p className="text-gray-600">Practice with realistic mock tests for NSAT and Coding NSAT</p>
                </div>

                {/* Free Pack Banner */}
                {accessLevel === 'none' && user && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-semibold">FREE Starter Pack</span>
                                </div>
                                <p className="text-blue-100">Get 1 NSAT Mock Test + 1 Coding Mock Test + PYQs - Absolutely FREE!</p>
                            </div>
                            <Button
                                onClick={() => claimMutation.mutate()}
                                disabled={claimMutation.isPending}
                                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6"
                            >
                                {claimMutation.isPending ? 'Claiming...' : 'Claim Now'}
                            </Button>
                        </div>
                    </div>
                )}

                {accessLevel === 'free' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">Free pack active! You have access to free mock tests.</span>
                        <Link href="/prep/nsat" className="ml-auto text-green-700 hover:text-green-900 font-medium">
                            Upgrade for full access →
                        </Link>
                    </div>
                )}

                {/* Tests Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test) => {
                            const hasAccess = canAccessTest(test);
                            return (
                                <div
                                    key={test._id}
                                    className={`bg-white rounded-2xl border ${hasAccess ? 'border-gray-100 hover:border-blue-200 hover:shadow-lg' : 'border-gray-200 opacity-80'} transition-all overflow-hidden`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex gap-2">
                                                <Badge variant={test.examType === 'nsat' ? 'default' : 'secondary'}>
                                                    {test.examType === 'nsat' ? 'NSAT' : 'Coding'}
                                                </Badge>
                                                <Badge className={getDifficultyColor(test.difficulty)}>
                                                    {test.difficulty}
                                                </Badge>
                                            </div>
                                            {test.isFree ? (
                                                <Badge className="bg-green-100 text-green-700">FREE</Badge>
                                            ) : (
                                                <Lock className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{test.description}</p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {test.duration} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {test.totalMarks} marks
                                            </div>
                                        </div>

                                        {hasAccess ? (
                                            <Link href={`/prep/nsat/mock-tests/${test.slug}`}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                                    Start Test
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/prep/nsat">
                                                <Button variant="outline" className="w-full">
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Unlock with Premium
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tests.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Mock Tests Available</h3>
                        <p className="text-gray-500">Check back soon for new mock tests!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

