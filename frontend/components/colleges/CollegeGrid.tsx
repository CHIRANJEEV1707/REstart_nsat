"use strict";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import CollegeCard from './CollegeCard';
import { College } from '@/types/college';
import { useDashboard } from '@/context/DashboardContext';

export default function CollegeGrid({
    filters,
    type = 'indian',
    onCardClick
}: {
    filters: { search: string; country: string; state?: string; exam: string; minFees?: string; maxFees?: string };
    type?: 'indian' | 'international' | 'newgen';
    onCardClick?: (collegeId: string) => void;
}) {
    const { openCollegeDetails } = useDashboard();

    // Fetch colleges
    const { data: responseData, isLoading, isError } = useQuery({
        // Include filters in queryKey to trigger refetch on change
        queryKey: ['colleges-all', type, filters],
        queryFn: async () => {
            // Determine endpoint based on type
            let endpoint = '/colleges?limit=200';
            const params = new URLSearchParams();

            // Common filters
            if (filters.search) params.append('search', filters.search);
            if (filters.exam) params.append('exam', filters.exam);

            if (type === 'international') {
                endpoint = '/international-colleges'; // Server-side filtering
                if (filters.country) params.append('country', filters.country);
                if (filters.minFees) params.append('minFee', filters.minFees);
                if (filters.maxFees) params.append('maxFee', filters.maxFees);
            } else if (type === 'newgen') {
                endpoint = '/newgen-colleges';
            } else {
                // For Indian/Generic, we currently fetch all and filter client-side (legacy behavior preserved)
                // But we can pass search to backend if supported. For now, keep as is for non-international.
            }

            const queryString = params.toString();
            const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

            const res = await api.get(fullUrl);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Keep fresh for 5 mins
    });

    // Map Backend Data to Frontend Interface
    const allColleges: College[] = useMemo(() => {
        // cast responseData to any to avoid type errors if inference fails
        const data = (responseData as any)?.data;
        if (!data) return [];
        return data.map((item: any) => ({
            _id: item._id,
            collegeId: item._id,
            name: item.name,
            image: item.image || '',
            location: item.location || { city: item.city || '', state: item.country || 'India' }, // Handle varied location structures
            country: item.country || 'India',
            fees: Number(item.fees || item.tuition_fee_annual || 0), // Ensure number
            currency: item.currency || (item.country === 'India' || !item.country ? 'INR' : 'USD'),
            exams_required: item.exams_required || item.entrance_exams || [], // Map different field names
            restart_score: Number(item.restart_score || 0),
            badges: item.badges || [],
            placement_stats: item.placement_stats || { average_package: 'N/A', highest_package: 'N/A' },
            financialSupportPercent: Number(item.restart_score || 0), // Mapping score to FS% as requested
            tags: item.badges || [],
            detailPageSlug: `/college/${item._id}`,
            // NewGen specific fields (if any, map them here)
            admission_mode: item.admission_mode || '',
            global_ranking: item.global_ranking,
        }));
    }, [responseData]);

    // Derived State: Filter logic
    const filteredColleges = useMemo(() => {
        // If type is International, we rely on Server-Side Filtering (as per new contract)
        // So we return allColleges directly (which are already filtered by the API)
        if (type === 'international') return allColleges;

        // For other types, keep Client-Side Filtering
        return allColleges.filter(college => {
            // 1. Search Filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesName = college.name.toLowerCase().includes(searchLower);
                const matchesCity = college.location.city.toLowerCase().includes(searchLower);
                const matchesState = college.location.state.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesCity && !matchesState) return false;
            }

            // 2. Country Filter
            if (filters.country && filters.country !== '') {
                if (college.country !== filters.country) return false;
            }

            // 2.1 State Filter
            if (filters.state && filters.state !== '') {
                // Ensure loose matching or exact? Exact for dropdown.
                if (college.location?.state !== filters.state) return false;
            }

            // 2.2 Budget Filter
            if (filters.maxFees && filters.maxFees !== '') {
                const max = Number(filters.maxFees);
                const fees = Number(college.fees || 0);
                if (fees > max) return false;
            }

            // 3. Exam Filter
            if (filters.exam && filters.exam !== '') {
                if (!college.exams_required.includes(filters.exam)) return false;
            }

            return true;
        });
    }, [allColleges, filters, type]);

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
            </div>
        );
    }

    if (isError) return (
        <div className="text-center py-20 bg-red-50/50 rounded-2xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-red-900 font-semibold">Unable to load colleges</h3>
            <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
        </div>
    );

    if (filteredColleges.length === 0) {
        return (
            <div className="text-center py-24 bg-gray-50/50 rounded-2xl border border-gray-200/50 border-dashed">
                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No colleges found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    We couldn't find any colleges matching your criteria. Try clearing some filters.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">
                Showing {filteredColleges.length} Colleges
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredColleges.map((college) => {
                    // Determine variant based on type or college data
                    let variant: 'traditional' | 'international' | 'newgen' = 'traditional';

                    if (type === 'international') variant = 'international';
                    else if (type === 'newgen') variant = 'newgen';

                    // Fallback to internal logic if type is mixed (unlikely with new structure but safe)
                    if (type === 'indian' && college.country !== 'India' && college.country) variant = 'international';

                    return (
                        <CollegeCard
                            key={college.collegeId}
                            college={college}
                            variant={variant}
                            onClick={() => {
                                if (onCardClick) {
                                    onCardClick(college.collegeId);
                                } else {
                                    openCollegeDetails(college.collegeId, type);
                                }
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
