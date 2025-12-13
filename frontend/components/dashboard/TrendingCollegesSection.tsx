"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { TrendingCollegeCard } from './TrendingCollegeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Flame } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export function TrendingCollegesSection() {
    const { openCollegeDetails } = useDashboard();

    const { data: trendingColleges, isLoading } = useQuery({
        queryKey: ['trending-colleges'],
        queryFn: async () => {
            const res = await api.get('/colleges/trending');
            return res.data.data;
        },
        staleTime: 10 * 60 * 1000 // 10 mins cache
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-[300px] rounded-xl flex-shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    if (!trendingColleges || trendingColleges.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 rounded-lg">
                        <Flame className="text-rose-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Trending Colleges
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">Popular choices this week</p>
                    </div>
                </div>
                {/* Optional View All */}
                {/* <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button> */}
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {trendingColleges.map((college: any) => (
                    <TrendingCollegeCard
                        key={college._id}
                        college={college}
                        onClick={() => {
                            // Map category to view type
                            let viewType: 'indian' | 'international' | 'newgen' = 'indian';
                            if (college.category === 'New-Gen') viewType = 'newgen';
                            if (college.category === 'International') viewType = 'international';

                            openCollegeDetails(college._id, viewType);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
