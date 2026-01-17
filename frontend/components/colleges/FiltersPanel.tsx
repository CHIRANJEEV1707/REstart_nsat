"use strict";
"use client";

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Search, MapPin, GraduationCap, RotateCcw, Filter, IndianRupee } from 'lucide-react';

import { SUPPORTED_COUNTRIES } from '@/constants/countries';
import { EXAMS_BY_COUNTRY, ALL_EXAMS, INTL_COMMON_EXAMS } from '@/constants/exams';
import { INDIAN_STATES } from '@/constants/states';
import { useDebounce } from '@/hooks/useDebounce';

interface FiltersPanelProps {
    onFilterChange: (filters: any) => void;
    viewType?: 'indian' | 'international' | 'newgen' | 'generic';
}

export default function FiltersPanel({ onFilterChange, viewType = 'generic' }: FiltersPanelProps) {
    // Initial state
    const [localFilters, setLocalFilters] = useState<{
        search: string;
        country: string;
        state: string;
        exam: string;
        minFees?: string;
        maxFees?: string;
    }>({
        search: '',
        country: '',
        state: '',
        exam: '',
        minFees: '',
        maxFees: ''
    });

    // Debounce the search term
    const debouncedSearch = useDebounce(localFilters.search, 500);

    const isIndianView = viewType === 'indian';

    // Trigger onFilterChange only when debouncedSearch or other filters change
    useEffect(() => {
        // We only want to trigger this when debouncedSearch actually changes, 
        // OR when other non-search filters change.
        // However, localFilters contains the *immediate* search value, which we don't want to send.
        // So we construct the filters payload using debouncedSearch.

        const filtersPayload = {
            ...localFilters,
            search: debouncedSearch
        };

        // There's a subtle issue here: standard filters (dropdowns) update localFilters immediately.
        // If we only listen to `debouncedSearch`, dropdown changes won't trigger updates until search changes?
        // No, we need to distinguish between "search updated" and "other filters updated".
        // BUT, simplified approach:
        // We can just call onFilterChange inside this effect, dependent on [debouncedSearch, localFilters.country, localFilters.state, ...]
        // But `localFilters` object reference changes on every edit.
        // Better: `handleChange` updates state. The Effect listens to specific dependencies.

        onFilterChange(filtersPayload);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        debouncedSearch,
        localFilters.country,
        localFilters.state,
        localFilters.exam,
        localFilters.minFees,
        localFilters.maxFees
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newFilters = { ...localFilters, [name]: value };

        // Logic specific to Generic View (Country -> Exams)
        if (name === 'country' && !isIndianView) {
            const countryExams = value ? (EXAMS_BY_COUNTRY[value] || []) : ALL_EXAMS;
            if (localFilters.exam && !countryExams.includes(localFilters.exam)) {
                newFilters.exam = '';
            }
        }

        setLocalFilters(newFilters);
        // REMOVED immediate onFilterChange(newFilters) call here. 
        // The useEffect above captures changes.
    };

    const handleReset = () => {
        const resetState = {
            search: '',
            country: '',
            state: '',
            exam: '',
            minFees: '',
            maxFees: ''
        };
        setLocalFilters(resetState);
        // onFilterChange(resetState); // The useEffect will catch this change too because the dependencies will verify.
        // Actually, for instant reset feedback, we might want to force it or let the effect handle it.
        // Steps: 
        // 1. setLocalFilters(resetState) -> triggers re-render
        // 2. useEffect sees [debouncedSearch (eventually), resetState.country, ...]
        // Problem: debouncedSearch will lag behind. 
        // However, if we reset, we might want to clear immediately.
        // Let's rely on the effect for consistency, or manually call it if lag is annoying.
        // For search clearing, the lag is fine or we can optimize later.
    };

    // Derived Lists
    let availableExams: string[] = [];

    if (viewType === 'indian') {
        availableExams = EXAMS_BY_COUNTRY['India'];
    } else if (viewType === 'international') {
        if (localFilters.country) {
            availableExams = EXAMS_BY_COUNTRY[localFilters.country] || ['IELTS']; // Fallback
        } else {
            // Rule 1: International Global Exams
            availableExams = INTL_COMMON_EXAMS;
        }
    } else {
        // Generic View
        availableExams = localFilters.country
            ? (EXAMS_BY_COUNTRY[localFilters.country] || [])
            : ALL_EXAMS;
    }

    const isExamsDisabled = !isIndianView && viewType !== 'international' && !!localFilters.country && availableExams.length === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 transition-all">
            {/* Search - Left Side */}
            <div className="relative w-full md:w-80 lg:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    name="search"
                    placeholder={isIndianView ? "Search by college or city..." : "Search colleges..."}
                    value={localFilters.search}
                    onChange={handleChange}
                    className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm rounded-lg w-full"
                />
            </div>

            {/* Filters - Right Side */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide pr-2">

                {/* 1. Location Filter: State (Indian) OR Country (Generic) */}
                <div className="flex items-center gap-2 min-w-fit">
                    <MapPin size={14} className="text-gray-400" />
                    {isIndianView ? (
                        <select
                            name="state"
                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-indigo-200 transition-all text-gray-700 min-w-[140px]"
                            value={localFilters.state}
                            onChange={handleChange}
                        >
                            <option value="">All States</option>
                            {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    ) : (
                        <select
                            name="country"
                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-indigo-200 transition-all text-gray-700 min-w-[140px]"
                            value={localFilters.country}
                            onChange={handleChange}
                        >
                            <option value="">All Locations</option>
                            {SUPPORTED_COUNTRIES
                                .filter(c => viewType !== 'international' || c !== 'India')
                                .map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                        </select>
                    )}
                </div>

                {/* 2. Budget Filter (Indian & International) */}
                {(isIndianView || viewType === 'international') && (
                    <div className="flex items-center gap-2 min-w-fit">
                        {/* Dynamic Icon based on currency? Or just generic Wallet/Banknote */}
                        {isIndianView ? <IndianRupee size={14} className="text-gray-400" /> : <span className="text-gray-400 text-sm font-bold">{localFilters.country === 'Germany' ? '€' : '$'}</span>}

                        <select
                            name="budgetRange"
                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:border-indigo-200 transition-all text-gray-700 min-w-[140px]"
                            value={
                                // Construct value from min/max for controlled input
                                localFilters.minFees && localFilters.maxFees
                                    ? `${localFilters.minFees}-${localFilters.maxFees}`
                                    : localFilters.maxFees
                                        ? `0-${localFilters.maxFees}` // For "Under X"
                                        : localFilters.minFees
                                            ? `${localFilters.minFees}-10000000` // For "X+"
                                            : ""
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                let min = '';
                                let max = '';

                                if (val) {
                                    if (val.includes('-')) {
                                        [min, max] = val.split('-');
                                    } else if (val.endsWith('+')) {
                                        min = val.replace('+', '');
                                    }
                                }

                                const newFilters = { ...localFilters, minFees: min, maxFees: max };
                                setLocalFilters(newFilters);
                                // useEffect handles propagation
                            }}
                        >
                            <option value="">Any Budget</option>
                            {isIndianView ? (
                                <>
                                    <option value="0-100000">Under ₹1 Lakh</option>
                                    <option value="0-200000">Under ₹2 Lakhs</option>
                                    <option value="0-400000">Under ₹4 Lakhs</option>
                                    <option value="0-800000">Under ₹8 Lakhs</option>
                                    <option value="0-1500000">Under ₹15 Lakhs</option>
                                    <option value="0-2500000">Under ₹25 Lakhs</option>
                                </>
                            ) : (
                                <>
                                    {/* International Ranges */}
                                    <option value="0-10000">Under {localFilters.country === 'Germany' ? '€' : '$'}10,000 / yr</option>
                                    <option value="10000-25000">{localFilters.country === 'Germany' ? '€' : '$'}10,000 - {localFilters.country === 'Germany' ? '€' : '$'}25,000 / yr</option>
                                    <option value="25000-50000">{localFilters.country === 'Germany' ? '€' : '$'}25,000 - {localFilters.country === 'Germany' ? '€' : '$'}50,000 / yr</option>
                                    <option value="50000-1000000">{localFilters.country === 'Germany' ? '€' : '$'}50,000+ / yr</option>
                                </>
                            )}
                        </select>
                    </div>
                )}

                {/* 3. Exam Filter */}
                <div className="flex items-center gap-2 min-w-fit">
                    <GraduationCap size={14} className={`text-gray-400 ${isExamsDisabled ? 'opacity-50' : ''}`} />
                    <select
                        name="exam"
                        disabled={isExamsDisabled}
                        className={`h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-gray-700 min-w-[140px] ${isExamsDisabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'cursor-pointer hover:border-indigo-200'}`}
                        value={localFilters.exam}
                        onChange={handleChange}
                    >
                        <option value="">
                            {isExamsDisabled
                                ? 'No exams available'
                                : (viewType === 'international' ? 'Select exam' : 'All Exams')}
                        </option>
                        {availableExams.map((exam) => (
                            <option key={exam} value={exam}>{exam}</option>
                        ))}
                    </select>
                </div>


                <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden md:block"></div>

                <button
                    onClick={handleReset}
                    className="whitespace-nowrap flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>
        </div >
    );
}
