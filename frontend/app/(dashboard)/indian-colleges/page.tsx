"use client";

import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";

export default function IndianCollegesPage() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        search: "",
        country: "India",
        state: "",
        exam: "",
        maxFees: ""
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Compass size={22} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Discover Indian Colleges
                    </h1>
                </div>
                <p className="text-gray-500 ml-[52px]">
                    Find your best fit engineering college in India with smart filters.
                </p>
            </div>

            <div className="space-y-6">
                <FiltersPanel onFilterChange={setFilters} viewType="indian" />
                <CollegeGrid
                    filters={filters}
                    type="indian"
                    onCardClick={(id) => router.push(`/college/${id}`)}
                />
            </div>
        </div>
    );
}
