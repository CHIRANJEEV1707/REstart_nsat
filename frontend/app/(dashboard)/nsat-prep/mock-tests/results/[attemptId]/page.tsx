'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Trophy, Target, Clock, AlertTriangle, TrendingUp, BarChart2, CheckCircle, XCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TestResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const attemptId = params.attemptId as string;

    const { data: attempt, isLoading } = useQuery({
        queryKey: ['testAttempt', attemptId],
        queryFn: async () => {
            const res = await api.get(`/mock-tests/attempts/${attemptId}`);
            return res.data?.data;
        }
    });

    // Check Free Pack Status
    const { data: freePackData } = useQuery({
        queryKey: ['freePackStatus'],
        queryFn: async () => {
            const res = await api.get('/free-pack');
            return res.data?.data;
        },
        enabled: !!user
    });

    if (isLoading) {
        return (
            <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-6">
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                    <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                    <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Result not found</h2>
                    <Button onClick={() => router.push('/nsat-prep/mock-tests')}>Go Back</Button>
                </div>
            </div>
        );
    }

    const { mockTestId: test, totalScore, totalViolations, analytics, totalTimeSpent } = attempt;

    // Check access rights
    const hasPurchasedBundle = (user?.purchasedBundles?.length ?? 0) > 0;
    const hasFreePack = freePackData?.hasFreepack || freePackData?.accessLevel === 'free';

    // If user has any premium access OR free pack, show results? 
    // Actually, for mock tests, if they could TAKE the test, they should see results.
    // The "Lock" usually applies to detailed analytics for FREE users on PREMIUM tests.
    // But if this is a "Free Pack" test, it should be unlocked.
    // Assuming 'isPremium' controls the locking of analytics section.

    const isPremium = hasPurchasedBundle || hasFreePack;

    // Use server-calculated accuracy (fallback to client calculation if missing)
    const serverAccuracy = analytics?.accuracy;
    const globalAccuracy = serverAccuracy !== undefined ? serverAccuracy : (
        (() => {
            const totalCorrect = analytics?.sectionWise?.reduce((acc: number, curr: any) => acc + curr.correct, 0) || 0;
            const totalIncorrect = analytics?.sectionWise?.reduce((acc: number, curr: any) => acc + curr.incorrect, 0) || 0;
            const totalAttempted = totalCorrect + totalIncorrect;
            return totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        })()
    );

    // Helper for formatting time
    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        return `${mins}m ${secs % 60}s`;
    };

    // Helper for section score display (handles negative)
    const getScoreDisplay = (score: number, maxScore: number) => {
        if (score < 0) {
            return { text: `${score}/${maxScore}`, isNegative: true };
        }
        return { text: `${score}/${maxScore}`, isNegative: false };
    };

    // Calculate progress bar width (handle negative scores)
    const getProgressWidth = (score: number, maxScore: number) => {
        if (maxScore === 0) return 0;
        // For negative scores, show a small red indicator
        if (score < 0) return 0;
        return Math.min(100, (score / maxScore) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/nsat-prep/mock-tests" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Mock Tests
                </Link>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">{test.title}</Badge>
                                <span className="text-sm text-gray-500">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                You Scored <span className="text-blue-600">{totalScore}</span> / {test.totalMarks}
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time Taken: {formatTime(totalTimeSpent)}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {!isPremium && (
                                <Link href="/nsat-prep">
                                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg">
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Unlock Detailed Analysis
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500 font-medium text-sm">Accuracy</span>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{globalAccuracy}%</div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-purple-500">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500 font-medium text-sm">Percentile</span>
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {isPremium ? `${analytics?.percentile || 0}th` : <span className="blur-sm select-none">95th</span>}
                        </div>
                        {!isPremium && <div className="text-xs text-purple-600 font-medium mt-1">Premium Feature</div>}
                    </Card>

                    <Card className="p-6 border-l-4 border-l-orange-500">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500 font-medium text-sm">Global Rank</span>
                            <Trophy className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {isPremium ? `#${analytics?.rank || '-'}` : <span className="blur-sm select-none">#124</span>}
                        </div>
                        {!isPremium && <div className="text-xs text-orange-600 font-medium mt-1">Premium Feature</div>}
                    </Card>

                    <Card className={`p-6 border-l-4 ${totalViolations <= 3 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500 font-medium text-sm">Proctoring Flags</span>
                            <AlertTriangle className={`w-5 h-5 ${totalViolations <= 3 ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{totalViolations}</div>
                        <div className={`text-xs font-medium mt-1 ${totalViolations <= 3 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalViolations <= 3 ? 'Acceptable' : 'Unacceptable'}
                        </div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Section Wise Analysis */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                            {!isPremium && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                    <Lock className="w-8 h-8 text-gray-400 mb-2" />
                                    <h3 className="font-bold text-gray-900">Section-wise Breakdown Locked</h3>
                                    <p className="text-sm text-gray-500 mb-4">Get detailed performance insights with Premium</p>
                                    <Link href="/nsat-prep">
                                        <Button>Unlock Premium</Button>
                                    </Link>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-blue-600" />
                                Section-wise Performance
                            </h2>

                            <div className="space-y-6">
                                {analytics?.sectionWise?.map((section: any, idx: number) => {
                                    const scoreInfo = getScoreDisplay(section.score, section.maxScore);
                                    const progressWidth = getProgressWidth(section.score, section.maxScore);

                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-gray-700">{section.section}</span>
                                                <span className={`${scoreInfo.isNegative ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    {scoreInfo.text} Marks
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                                                {scoreInfo.isNegative ? (
                                                    // Show red indicator for negative scores
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs text-red-500 font-medium">Negative</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full transition-all"
                                                        style={{ width: `${progressWidth}%` }}
                                                    ></div>
                                                )}
                                            </div>
                                            {/* Show accuracy per section */}
                                            <div className="text-xs text-gray-400 mt-1">
                                                Accuracy: {section.accuracy}% • {section.correct} correct, {section.incorrect} wrong, {section.unattempted} skipped
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!analytics?.sectionWise || analytics.sectionWise.length === 0) && (
                                    <p className="text-gray-500 text-center py-4">No data available</p>
                                )}
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                            {!isPremium && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                    <Target className="w-8 h-8 text-indigo-400 mb-2" />
                                    <h3 className="font-bold text-gray-900">AI Focus Recommendations Locked</h3>
                                    <p className="text-sm text-gray-500 mb-4">Get personalized study plans based on your weak areas</p>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                AI Focus Recommendations
                            </h2>
                            <ul className="space-y-3">
                                {analytics?.recommendations?.map((rec: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span className="text-gray-700">{rec}</span>
                                    </li>
                                ))}
                                {(!analytics?.recommendations || analytics.recommendations.length === 0) && (
                                    <p className="text-indigo-400 text-center italic">Complete more tests to generate recommendations.</p>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
                            <div className="space-y-3">
                                <Link href="/nsat-prep/mock-tests">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Take Another Test
                                    </Button>
                                </Link>
                                <Link href="/nsat-prep/pyqs">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Practice PYQs
                                    </Button>
                                </Link>
                                <Link href="/nsat-prep/interview-guide">
                                    <Button variant="outline" className="w-full justify-start">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Read Interview Guide
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
