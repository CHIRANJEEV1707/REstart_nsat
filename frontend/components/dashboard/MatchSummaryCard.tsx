"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from "@/components/ui/Button";
import { ArrowRight, Target, IndianRupee, MapPin } from "lucide-react";
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from "@/components/ui/Card";
import { useDashboard } from "@/context/DashboardContext";

export function MatchSummaryCard() {
    const { setActiveView } = useDashboard();

    const { data, isLoading } = useQuery({
        queryKey: ['recommendations'],
        queryFn: async () => {
            const res = await api.get('/colleges/recommendations');
            return res.data;
        },
        staleTime: 5 * 60 * 1000
    });

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 border-none shadow-xl text-white relative overflow-hidden h-full">
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-6">
                    <Skeleton className="w-full h-full min-h-[300px] rounded-xl bg-indigo-900/10" />
                </CardContent>
            </Card>
        );
    }

    const meta = data?.meta;

    if (!meta || meta.totalMatches === 0) {
        return (
            <Card className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 border-none shadow-xl text-white relative overflow-hidden h-full">
                <CardContent className="p-8 relative z-10 flex flex-col justify-center items-center text-center h-full">
                    <Target className="w-12 h-12 text-indigo-300 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Find Your Perfect College</h2>
                    <p className="text-indigo-200 mb-6 max-w-sm">
                        Complete your profile and set preferences to get personalized AI recommendations.
                    </p>
                    <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                        Update Preferences
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 border-none shadow-xl text-white relative overflow-hidden h-full">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-100">
                        <Target size={18} />
                        <span className="text-sm font-medium tracking-wide uppercase">College Fit Analysis</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">
                        You matched with <span className="text-white border-b-2 border-yellow-400 pb-0.5">{meta.totalMatches} Colleges</span>
                    </h2>

                    <p className="text-indigo-100 max-w-md">
                        Based on your preference for <strong>{meta.preferredCountry}</strong> and budget.
                    </p>

                    <div className="flex items-center gap-6 mt-6">
                        {/* AVG FIT SCORE */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="font-bold text-lg">{Math.round(meta.avgFitScore)}%</span>
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Avg Fit<br />Score</span>
                        </div>

                        {/* BUDGET MATCH */}
                        <div className={`flex items-center gap-2 ${!meta.budgetMatched ? 'opacity-50' : ''}`} title={!meta.budgetMatched ? "Some colleges exceed your budget" : "Within Budget"}>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <IndianRupee size={16} />
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Budget<br />Match</span>
                        </div>

                        {/* LOCATION MATCH */}
                        <div className={`flex items-center gap-2 ${!meta.locationMatched ? 'opacity-50' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <MapPin size={16} />
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Loc<br />Pref</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setActiveView('discover')}
                    className="flex-shrink-0 bg-white text-indigo-600 px-6 py-6 rounded-full font-bold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2 text-base"
                >
                    View Top Matches <ArrowRight size={18} />
                </Button>
            </CardContent>
        </Card>
    );
}
