"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";

export function DiscoverView() {
    const [filters, setFilters] = useState({
        search: "",
        country: "",
        exam: ""
    });

    return (
        <div className="p-6 md:p-8 max-w-full mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Colleges</h1>
                <p className="text-lg text-gray-500">Find your best fit engineering college with smart filters.</p>
            </div>

            <div className="space-y-6">
                <FiltersPanel onFilterChange={setFilters} />
                <CollegeGrid filters={filters} />
            </div>
        </div>
    );
}
