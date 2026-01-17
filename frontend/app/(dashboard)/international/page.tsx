"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";
import { Globe } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function InternationalCollegesPage() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        search: "",
        country: "",
        exam: ""
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 animate-fade-in-up">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                        <Globe size={20} />
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900">Study Abroad</h1>
                </div>
                <p className="text-gray-600 ml-1">
                    Explore top international universities, global opportunities, and visa requirements.
                </p>
            </div>

            <div className="space-y-6">
                <FiltersPanel onFilterChange={setFilters} viewType="international" />
                <CollegeGrid
                    filters={filters}
                    type="international"
                    onCardClick={(id) => router.push(`/college/${id}`)}
                />
            </div>
        </div>
    );
}
