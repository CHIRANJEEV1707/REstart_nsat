"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import NewGenCollegeDetailView from "./NewGenCollegeDetailView";

export function NewGenView() {
    const [filters, setFilters] = useState({
        search: "",
        country: "",
        exam: ""
    });
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

    // If detail view is active, show it
    if (selectedCollegeId) {
        return (
            <NewGenCollegeDetailView
                collegeId={selectedCollegeId}
                onBack={() => setSelectedCollegeId(null)}
            />
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-full mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            {/* Unique Header for New-Gen */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            Future of Education
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">New-Gen Tech Schools</h1>
                    <p className="text-slate-400 max-w-xl">
                        Industry-led programs focused on real skills, real projects, and real placements.
                    </p>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/5 hidden md:block">
                    <Sparkles size={180} />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-end">
                    {/* Add specific search or filters here if needed later */}
                </div>

                <CollegeGrid
                    filters={filters}
                    type="newgen"
                    onCardClick={(id) => setSelectedCollegeId(id)}
                />
            </div>
        </div>
    );
}
