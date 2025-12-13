"use client";

import { useDashboard } from "@/context/DashboardContext";
import { MatchSummaryCard } from "@/components/dashboard/MatchSummaryCard";
import { RecommendedCollegesCard } from "@/components/dashboard/RecommendedCollegesCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { SavedCollegesCard } from "@/components/dashboard/SavedCollegesCard";

export function OverviewView({ dashboard }: { dashboard: any }) {
    // Note: If you need to switch views from here (e.g. "View All" buttons), use useDashboard()
    const { setActiveView } = useDashboard();

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            {/* 1. College Fit Hero */}
            <div className="h-[300px]">
                <MatchSummaryCard data={dashboard.fit_overview} user={dashboard.user} />
            </div>
            {/* 2. Recommended Colleges Carousel */}
            <RecommendedCollegesCard colleges={dashboard.recommendations} />

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
