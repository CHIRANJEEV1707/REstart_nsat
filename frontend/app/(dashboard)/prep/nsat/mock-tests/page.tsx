'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, FileText, Lock, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

import { ReferralCard } from '@/components/ReferralCard';

interface MockTest {
    _id: string;
    title: string;
    slug: string;
    description: string;
    examType: 'nsat' | 'coding-nsat';
    duration: number;
    totalMarks: number;
    questionCount?: number;
    sections: { name: string; questionCount: number; marks: number }[];
    isFree: boolean;
    isPremium: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    requiredBundle?: 'free' | 'premium';
    testCategory?: 'general' | 'coding';
}

type FilterType = 'all' | 'general' | 'coding';

export default function MockTestsPage() {
    const { user } = useAuth();
    const [accessLevel, setAccessLevel] = useState<'none' | 'free' | 'premium'>('none');
    const [filter, setFilter] = useState<FilterType>('all');


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
    const { data: testsData, isLoading, isError } = useQuery({
        queryKey: ['mockTests', 'nsat'],
        queryFn: async () => {
            const [nsatRes, codingRes] = await Promise.all([
                api.get('/mock-tests?examType=nsat'),
                api.get('/mock-tests?examType=coding-nsat')
            ]);
            const nsatTests = nsatRes.data?.data || [];
            const codingTests = codingRes.data?.data || [];
            return [...nsatTests, ...codingTests];
        }
    });



    // ------------------------------------------------------------------
    // FILTERING LOGIC
    // ------------------------------------------------------------------
    // 1. Strict Content Filter: Show ONLY "NSAT ... Mock ..." tests
    //    Exclude Practice Sets, PYQs, Interview, Phase 2, etc.
    const isFullMock = (test: MockTest) => {
        const t = test.title.toLowerCase();
        // Must explicitly contain "mock"
        if (!t.includes('mock')) return false;

        // Exclude specific unwanted strings
        if (t.includes('practice set')) return false;
        if (t.includes('interview')) return false;
        if (t.includes('pyq')) return false;
        if (t.includes('phase 2')) return false;

        return true;
    };

    // Helper to check if test has questions (for showing "Coming Soon" badge)
    const hasQuestions = (test: MockTest) => (test.questionCount || 0) > 0;

    // 2. Bundle Relevance Filter: 
    //    If user has strict "coding_only" -> Show ONLY coding tests
    //    If "general_only" -> Show ONLY general tests
    //    Else -> Show Both
    const getUserRelevance = (test: MockTest) => {
        if (!user || !user.purchasedBundles || user.purchasedBundles.length === 0) return true; // Show all to non-buyers (upsell)

        // Check active bundles
        const activeBundles = user.purchasedBundles.filter((b: any) =>
            b.verificationStatus === 'active' || b.verificationStatus === 'approved'
        );

        if (activeBundles.length === 0) return true;

        // Determine if restricted
        const hasCodingOnly = activeBundles.some((b: any) => b.bundleId?.variant === 'coding');
        const hasGeneralOnly = activeBundles.some((b: any) => b.bundleId?.variant === 'general');
        const hasCombined = activeBundles.some((b: any) => !b.bundleId?.variant || b.bundleId?.variant === 'combined');

        // If they have combined, they see everything
        if (hasCombined) return true;

        // If strict separate bundles
        const isCodingTest = test.testCategory === 'coding' || test.examType === 'coding-nsat';
        const isGeneralTest = test.testCategory === 'general' || test.examType === 'nsat';

        // Use Set logic: Show if (HasCoding AND IsCoding) OR (HasGeneral AND IsGeneral)
        // If they have both separate bundles, they see both.
        if (hasCodingOnly && isCodingTest) return true;
        if (hasGeneralOnly && isGeneralTest) return true;

        return false;
    };

    const allTests = testsData || [];

    // 0 = free tier (Tests 01-04), 1 = premium tier (Tests 05-10)
    const getTestTier = (test: MockTest): 0 | 1 => {
        if (test.requiredBundle === 'free' || test.isFree) return 0;
        if (test.requiredBundle === 'premium') return 1;

        // Fallback: infer from title number
        const match = (test.title || '').match(/(?:mock|test)\s*(?:test\s*)?(\d+)/i) || (test.title || '').match(/(\d+)$/);
        const num = match ? parseInt(match[1], 10) : 99;
        return num >= 1 && num <= 4 ? 0 : 1;
    };

    const canAccessTest = (test: MockTest) => {
        const tier = getTestTier(test);
        if (tier === 0) return accessLevel === 'free' || accessLevel === 'premium';
        return accessLevel === 'premium';
    };

    const displayTests = allTests.filter(t => isFullMock(t));

    const tierGroups = {
        free: displayTests.filter(t => getTestTier(t) === 0),
        premium: displayTests.filter(t => getTestTier(t) === 1),
    };

    const renderTestCard = (test: MockTest) => {
        const hasAccess = canAccessTest(test);
        const requiredLabel = getTestTier(test) === 0 ? 'Free Pack' : 'Premium';
        const testHasQuestions = hasQuestions(test);

        // Filter Check
        const testCategory = test.testCategory || (test.examType === 'coding-nsat' ? 'coding' : 'general');
        if (filter !== 'all' && testCategory !== filter) return null;

        return (
            <div
                key={test._id}
                className={`bg-white rounded-2xl border ${hasAccess && testHasQuestions ? 'border-gray-100 hover:border-blue-200 hover:shadow-lg' : 'border-gray-200 opacity-80'} transition-all overflow-hidden flex flex-col`}
            >
                <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                            <Badge variant={test.examType === 'nsat' ? 'default' : 'secondary'} className="text-xs">
                                {test.examType === 'nsat' ? 'General' : 'Coding'}
                            </Badge>
                            {!testHasQuestions && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">Coming Soon</Badge>
                            )}
                        </div>
                        {hasAccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{test.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}m</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {test.totalMarks}</span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {!testHasQuestions ? (
                        <Button size="sm" variant="outline" className="w-full text-xs opacity-50" disabled>
                            Coming Soon
                        </Button>
                    ) : hasAccess ? (
                        <Link href={`/prep/nsat/mock-tests/${test.slug}`} className="w-full">
                            <Button size="sm" className="w-full text-white" style={{ background: '#0085ff' }}>Start Test</Button>
                        </Link>
                    ) : (
                        <Link href="/prep/nsat" className="w-full">
                            <Button size="sm" variant="outline" className="w-full text-xs">
                                <Lock className="w-3 h-3 mr-2" /> Unlock ({requiredLabel})
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        );
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
                <Link href="/prep/nsat" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to NSAT Prep
                </Link>

                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Tests</h1>
                        <p className="text-gray-600">Master every level of the NSAT exam.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                        {(['all', 'general', 'coding'] as FilterType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === type
                                    ? 'text-[#0085ff]'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                style={filter === type ? { background: 'rgba(0,133,255,0.08)' } : undefined}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && (
                    <div className="text-center py-12">Loading tests...</div>
                )}

                {isError && (
                    <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-100 mx-auto max-w-lg">
                        <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <div className="text-lg font-bold mb-2">Failed to load tests</div>
                        <p className="mb-4 text-sm text-red-600">Unable to fetch mock tests from the server.</p>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="bg-white hover:bg-red-50">
                            Retry
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && displayTests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No mock tests found matching your criteria.</p>
                    </div>
                )}

                {!isLoading && !isError && displayTests.length > 0 && (
                    <div className="space-y-12">
                        {/* Free Tier */}
                        {tierGroups.free.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-gray-900">Free Tests</h2>
                                    <Badge className="bg-green-100 text-green-700">Claim free pack to access</Badge>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {tierGroups.free.map(renderTestCard)}
                                </div>
                            </section>
                        )}

                        {/* Premium Tier */}
                        {tierGroups.premium.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-1 rounded-full" style={{ background: '#0085ff' }}></div>
                                    <h2 className="text-xl font-bold text-gray-900">Premium Tests</h2>
                                    <Badge variant="outline" className="text-[#0085ff] border-[rgba(0,133,255,0.3)]">₹800 — Lifetime access</Badge>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {tierGroups.premium.map(renderTestCard)}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Referral Card (Separate) */}
                <ReferralCard />



            </div>
        </div>
    );
}
