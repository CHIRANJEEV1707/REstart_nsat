"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";

export function DiscoverIndianView() {
    const [filters, setFilters] = useState({
        search: "",
        country: "India", // Default to India for this view
        state: "",
        exam: "",
        maxFees: ""
    });

    return (
        <div className="p-6 md:p-8 max-w-full mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Indian Colleges</h1>
                <p className="text-gray-500">Find your best fit engineering college in India with smart filters.</p>
            </div>

            <div className="space-y-6">
                {/* 
                  Pass initial filters. 
                  Note: FiltersPanel might need adjustment if we want to hide Country filter in this view, 
                  but strictly speaking we just want to discover Indian colleges.
                */}
                <FiltersPanel onFilterChange={setFilters} viewType="indian" />
                <CollegeGrid filters={filters} type="indian" />
            </div>
        </div>
    );
}
