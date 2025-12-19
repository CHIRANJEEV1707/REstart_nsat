"use client";

import { useDashboard } from "@/context/DashboardContext";
import { MatchSummaryCard } from "@/components/dashboard/MatchSummaryCard";
import { RecommendedCollegesCard } from "@/components/dashboard/RecommendedCollegesCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { SavedCollegesCard } from "@/components/dashboard/SavedCollegesCard";
import CollegeCard from "@/components/colleges/CollegeCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Sparkles, Globe } from "lucide-react";

export function OverviewView({ dashboard }: { dashboard: any }) {
    // Note: If you need to switch views from here (e.g. "View All" buttons), use useDashboard()
    const { setActiveView, openCollegeDetails } = useDashboard();

    // Preference Checks
    const showNewGen = dashboard.user.preferences?.newGenInterest || dashboard.user.preferences?.aspiringCollegeType?.includes("New-Gen");
    const showInternational = dashboard.user.preferences?.preferredCountries?.some((c: string) => c !== 'India');

    // Fetch New-Gen Colleges
    const { data: newGenColleges } = useQuery({
        queryKey: ['newgen-colleges'],
        queryFn: async () => {
            const res = await api.get('/colleges/new-gen');
            return res.data.data;
        },
        enabled: !!showNewGen
    });

    // Fetch International Colleges
    const { data: internationalColleges } = useQuery({
        queryKey: ['international-colleges', dashboard.user.preferences?.preferredCountries],
        queryFn: async () => {
            const countries = dashboard.user.preferences?.preferredCountries?.filter((c: string) => c !== 'India').join(',');
            const res = await api.get(`/colleges/international?country=${countries}`);
            return res.data.data;
        },
        enabled: !!showInternational
    });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            {/* 1. College Fit Hero */}
            <div className="h-[300px]">
                <MatchSummaryCard />
            </div>
            {/* 2. Recommended Colleges Carousel */}
            <RecommendedCollegesCard />

            {/* 🆕 New-Gen Colleges Section */}
            {showNewGen && newGenColleges?.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-600 w-5 h-5" />
                        <h2 className="text-xl font-bold text-gray-900">New-Gen Tech Schools</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {newGenColleges.map((col: any) => (
                            <div key={col._id} className="h-full">
                                <CollegeCard
                                    college={col}
                                    variant="newgen"
                                    onClick={() => openCollegeDetails(col._id, 'newgen')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🌍 International Colleges Section */}
            {showInternational && internationalColleges?.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="text-blue-600 w-5 h-5" />
                        <h2 className="text-xl font-bold text-gray-900">Global Opportunities</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {internationalColleges.map((col: any) => (
                            <div key={col._id} className="h-full">
                                <CollegeCard
                                    college={col}
                                    variant="international"
                                    onClick={() => openCollegeDetails(col._id, 'international')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Deadlines & Updates Row */}
            <div className="grid md:grid-cols-2 gap-8">
                <DeadlinesCard deadlines={dashboard.deadlines} />
                <div className="space-y-8">
                    {/* Pass setActiveView-like functionality if component supports it, otherwise rely on internal links being changed later? 
                        Wait, SavedCollegesCard likely has a "View All" link. We need to handle that. 
                        Ideally, we refactor SavedCollegesCard to accept an onClick or we just wrap it.
                    */}
                    <div className="relative group" onClick={() => setActiveView("saved")}>
                        <SavedCollegesCard colleges={dashboard.saved_colleges} count={dashboard.user.saved_count} />
                        {/* Overlay to intercept click if needed, or just better to refactor the card itself */}
                    </div>
                </div>
            </div>
        </div>
    );
}
