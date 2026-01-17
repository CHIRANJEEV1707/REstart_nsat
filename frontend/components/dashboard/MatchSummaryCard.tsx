"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from "@/components/ui/Button";
import { ArrowRight, Target, IndianRupee, MapPin, CheckCircle2 } from "lucide-react";
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';

export function MatchSummaryCard() {
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-recommendations'],
        queryFn: async () => {
            const res = await api.get('/recommendations/dashboard');
            return res.data;
        },
        staleTime: 5 * 60 * 1000
    });

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 h-full animate-pulse">
                <Skeleton className="w-32 h-4 bg-white/20 mb-4" />
                <Skeleton className="w-3/4 h-8 bg-white/20 mb-6" />
                <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                    <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                    <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                </div>
            </div>
        );
    }

    const meta = data?.meta;
    const count = data?.topMatches?.length || 0;

    if (!meta || count === 0) {
        return (
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 rounded-2xl p-8 h-full flex flex-col justify-center items-center text-center text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <Target className="w-12 h-12 text-indigo-200 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Find Your Perfect College</h2>
                <p className="text-indigo-100 mb-6 max-w-sm">
                    Complete your profile and set preferences to get personalized AI recommendations.
                </p>
                <Button
                    className="bg-white text-indigo-600 hover:bg-indigo-50"
                    onClick={() => router.push('/onboarding?edit=true')}
                >
                    Update Preferences
                </Button>
            </div>
        );
    }

    return (
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 rounded-2xl p-8 h-full text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-6">
                <div className="flex-1">
                    {/* Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-medium text-indigo-100 mb-4">
                        <CheckCircle2 size={14} />
                        College Fit Analysis
                    </div>

                    {/* Headline */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                        You matched with{' '}
                        <span className="relative">
                            {count} Colleges
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400/60 rounded-full" />
                        </span>
                    </h2>

                    <p className="text-indigo-100 max-w-lg text-sm md:text-base">
                        Based on your preference for <strong className="text-white">your goals</strong> and budget.
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-6">
                        {/* Avg Match Score */}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <span className="font-bold text-lg">{Math.round(meta.avgMatch || 0)}%</span>
                            </div>
                            <div className="text-xs text-indigo-100 leading-snug">
                                <div className="font-semibold text-white">Avg Match</div>
                                Score
                            </div>
                        </div>

                        {/* Budget Match */}
                        <div className={`flex items-center gap-3 ${!meta.budgetMatch ? 'opacity-50' : ''}`}>
                            <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                <IndianRupee size={18} />
                            </div>
                            <div className="text-xs text-indigo-100 leading-snug">
                                <div className="font-medium text-white">Budget</div>
                                Match
                            </div>
                        </div>

                        {/* Location Match */}
                        <div className={`flex items-center gap-3 ${!meta.locationMatch ? 'opacity-50' : ''}`}>
                            <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                <MapPin size={18} />
                            </div>
                            <div className="text-xs text-indigo-100 leading-snug">
                                <div className="font-medium text-white">Location</div>
                                Match
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={() => {
                        const element = document.getElementById('recommended-section');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    size="lg"
                    className="flex-shrink-0 bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 rounded-full px-6"
                >
                    View Top Matches <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
