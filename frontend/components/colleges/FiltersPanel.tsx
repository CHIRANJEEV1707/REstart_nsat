"use client";

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function FiltersPanel({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [localFilters, setLocalFilters] = useState({
        search: '',
        state: '',
        minFees: '',
        maxFees: '',
        exam: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...localFilters, [name]: value };
        setLocalFilters(newFilters);
        // Debouncing could be added here, but for simplicity we'll just propagate or use Apply button
        onFilterChange(newFilters);
    };

    // Real implementation would utilize a debounce hook for search text

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8 sticky top-24">
            <div>
                <h3 className="font-bold text-gray-900 mb-4">Search</h3>
                <Input
                    name="search"
                    placeholder="Search by name..."
                    value={localFilters.search}
                    onChange={handleChange}
                />
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-4">Location</h3>
                <select
                    name="state"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={localFilters.state}
                    onChange={handleChange}
                >
                    <option value="">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
            </div>

            <div>
                <h3 className="font-bold text-gray-900 mb-4">Exam Accepted</h3>
                <select
                    name="exam"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={localFilters.exam}
                    onChange={handleChange}
                >
                    <option value="">All Exams</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="BITSAT">BITSAT</option>
                    <option value="VITEEE">VITEEE</option>
                </select>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                    setLocalFilters({ search: '', state: '', minFees: '', maxFees: '', exam: '' });
                    onFilterChange({});
                }}
            >
                Reset Filters
            </Button>
        </div>
    );
}
