"use strict";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import CollegeCard from './CollegeCard';
import { College } from '@/types/college';

export default function CollegeGrid({ filters }: { filters: { search: string; country: string; exam: string } }) {
    // Fetch all colleges once for client-side filtering (Simulating "instant" updates)
    // In a real app with thousands of records, we'd debounce server-side search.
    // Given the requirement for "instant" updates and "hundreds" (not millions) of colleges, exact client-side filtering is excellent.
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['colleges-all'],
        queryFn: async () => {
            // Fetch a large batch to simulate "all" for client-side filtering capabilities
            const res = await api.get('/colleges?limit=200');
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Keep fresh for 5 mins
    });

    // Map Backend Data to Frontend Interface
    const allColleges: College[] = useMemo(() => {
        if (!responseData?.data) return [];
        return responseData.data.map((item: any) => ({
            _id: item._id,
            collegeId: item._id,
            name: item.name,
            image: item.image,
            location: item.location,
            country: item.country,
            fees: item.fees,
            currency: item.country === 'India' ? 'INR' : 'USD', // Simple heuristic
            exams_required: item.exams_required || [],
            restart_score: item.restart_score,
            badges: item.badges || [],
            placement_stats: item.placement_stats,
            financialSupportPercent: item.restart_score, // Mapping score to FS% as requested
            tags: item.badges,
            detailPageSlug: `/college/${item._id}`
        }));
    }, [responseData]);

    // Derived State: Filter logic
    const filteredColleges = useMemo(() => {
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

            // 3. Exam Filter
            if (filters.exam && filters.exam !== '') {
                if (!college.exams_required.includes(filters.exam)) return false;
            }

            return true;
        });
    }, [allColleges, filters]);

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
                {filteredColleges.map((college) => (
                    <CollegeCard key={college.collegeId} college={college} />
                ))}
            </div>
        </div>
    );
}
