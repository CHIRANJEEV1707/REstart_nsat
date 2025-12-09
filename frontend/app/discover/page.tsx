"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollegeGrid from "@/components/colleges/CollegeGrid";
import FiltersPanel from "@/components/colleges/FiltersPanel";
import { useState } from "react";

export default function DiscoverPage() {
    const [filters, setFilters] = useState({});

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Colleges</h1>
                    <p className="text-lg text-gray-500">Find your best fit engineering college with smart filters.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <FiltersPanel onFilterChange={setFilters} />
                    </aside>
                    <section className="flex-1">
                        <CollegeGrid filters={filters} />
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
