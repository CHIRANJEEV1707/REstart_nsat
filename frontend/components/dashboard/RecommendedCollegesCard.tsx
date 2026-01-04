"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import { useDashboard } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/Skeleton';
import CollegeCard from "@/components/colleges/CollegeCard";

export function RecommendedCollegesCard() {
    const { openCollegeDetails } = useDashboard();

    const { data: response, isLoading } = useQuery({
        queryKey: ['dashboard-recommendations'],
        queryFn: async () => {
            const res = await api.get('/recommendations/dashboard');
            return res.data;
        },
        staleTime: 5 * 60 * 1000 // 5 mins
    });

    const recommendations = response?.topMatches || [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[280px] rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="p-8 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-300">
                <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">No Strong Matches Found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">No colleges strongly match your preferences yet.<br />Update your budget, exams, or location to get better recommendations.</p>
                <Button className="mt-4" variant="outline" size="sm">Update Preferences</Button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Recommended for You
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 3).map((college: any) => {
                    // Determine variant based on type
                    let variant: 'traditional' | 'international' | 'newgen' = 'traditional';
                    if (college.type === 'New-Gen' || college.isNewGen) variant = 'newgen';
                    else if (college.type === 'International' || (college.country && college.country !== 'India')) variant = 'international';

                    return (
                        <CollegeCard
                            key={college._id}
                            college={{
                                ...college,
                                collegeId: college._id, // Normalize ID for card
                                tags: college.why // Pass reasons as tags
                            }}
                            variant={variant}
                            onClick={() => openCollegeDetails(college._id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
