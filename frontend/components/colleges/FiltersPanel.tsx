"use client";

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Search, MapPin, GraduationCap, RotateCcw, Filter } from 'lucide-react';

import { SUPPORTED_COUNTRIES } from '@/constants/countries';
import { EXAMS_BY_COUNTRY, ALL_EXAMS } from '@/constants/exams';

export default function FiltersPanel({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [localFilters, setLocalFilters] = useState({
        search: '',
        country: '',
        exam: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newFilters = { ...localFilters, [name]: value };

        // Reset exam if country changes and current exam is not valid for new country
        if (name === 'country') {
            const countryExams = value ? (EXAMS_BY_COUNTRY[value] || []) : ALL_EXAMS;
            if (localFilters.exam && !countryExams.includes(localFilters.exam)) {
                newFilters.exam = '';
            }
        }

        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Derive available exams
    const availableExams = localFilters.country
        ? (EXAMS_BY_COUNTRY[localFilters.country] || [])
        : ALL_EXAMS;

    const isExamsDisabled = !!localFilters.country && availableExams.length === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
            {/* Search - Left Side */}
            <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    name="search"
                    placeholder="Search colleges..."
                    value={localFilters.search}
                    onChange={handleChange}
                    className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm rounded-lg w-full"
                />
            </div>

            {/* Filters - Right Side */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">

                <div className="flex items-center gap-2 min-w-fit">
                    <MapPin size={14} className="text-gray-400" />
                    <select
                        name="country"
                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-indigo-200 transition-all text-gray-700 min-w-[140px]"
                        value={localFilters.country}
                        onChange={handleChange}
                    >
                        <option value="">All Locations</option>
                        {SUPPORTED_COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 min-w-fit">
                    <GraduationCap size={14} className={`text-gray-400 ${isExamsDisabled ? 'opacity-50' : ''}`} />
                    <select
                        name="exam"
                        disabled={isExamsDisabled}
                        className={`h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-gray-700 min-w-[140px] ${isExamsDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'cursor-pointer hover:border-indigo-200'}`}
                        value={localFilters.exam}
                        onChange={handleChange}
                    >
                        <option value="">{isExamsDisabled ? 'No exams available' : 'All Exams'}</option>
                        {availableExams.map((exam) => (
                            <option key={exam} value={exam}>{exam}</option>
                        ))}
                    </select>
                </div>

                <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden md:block"></div>

                <button
                    onClick={() => {
                        setLocalFilters({ search: '', country: '', exam: '' });
                        onFilterChange({ search: '', country: '', exam: '' });
                    }}
                    className="whitespace-nowrap flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>
        </div >
    );
}
