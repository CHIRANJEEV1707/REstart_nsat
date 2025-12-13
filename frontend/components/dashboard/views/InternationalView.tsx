"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";
import { Globe, Search } from 'lucide-react';

export function InternationalView() {
    const [filters, setFilters] = useState({
        search: "",
        country: "",
        exam: ""
    });

    return (
        <div className="p-6 md:p-8 max-w-full mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
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
                {/* 
                    For now, passing empty filters or simple search. 
                    CollegeGrid handles the "international" type fetching.
                */}
                <FiltersPanel onFilterChange={setFilters} viewType="international" />
                <CollegeGrid
                    filters={filters}
                    type="international"
                />
            </div>
        </div>
    );
}
