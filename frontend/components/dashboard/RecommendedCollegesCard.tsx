"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useDashboard } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/Skeleton';

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
                {recommendations.slice(0, 3).map((college: any, idx: number) => {
                    // Dynamic Badge Color
                    const matchScore = college.matchPercentage || 0;
                    let badgeColor = "bg-gray-500";
                    if (matchScore >= 90) badgeColor = "bg-emerald-500";
                    else if (matchScore >= 80) badgeColor = "bg-yellow-500"; // Updated threshold 80-89

                    // Category Image Fallback (No single static image)
                    const isInternational = college.type === 'International' || (college.country && college.country !== 'India');
                    const isNewGen = college.type === 'New-Gen';
                    const fallbackImage = isInternational
                        ? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                        : isNewGen
                            ? "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1000&auto=format&fit=crop"
                            : "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop";

                    return (
                        <Card
                            key={college._id || idx}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-indigo-50/50 bg-white"
                            onClick={() => {
                                let viewType: 'indian' | 'international' | 'newgen' = 'indian';
                                if (isNewGen) viewType = 'newgen';
                                if (isInternational) viewType = 'international';
                                openCollegeDetails(college._id);
                            }}
                        >
                            {/* Image Header with Fit Score */}
                            <div className="relative h-40">
                                <Image
                                    src={college.image || fallbackImage}
                                    alt={college.name || "College"}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Match Percentage Badge */}
                                <div className={`absolute top-3 right-3 ${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm bg-opacity-90`}>
                                    <Sparkles size={11} fill="currentColor" />
                                    {matchScore}% Match
                                </div>

                                <div className="absolute bottom-3 left-4 right-4">
                                    <h3 className="font-bold text-white text-lg leading-tight truncate">
                                        {college.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-gray-200 text-xs mt-1">
                                        <MapPin size={12} />
                                        {/* Dynamic Location ONLY */}
                                        {college.city}, {college.country}
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 space-y-3">
                                {/* AI Reasons - Only render what backend sends */}
                                <div className="flex flex-wrap gap-2">
                                    {college.why?.slice(0, 4).map((reason: string, rIdx: number) => (
                                        <span key={`${college._id}-reason-${rIdx}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                                            <CheckCircle2 size={10} className="text-indigo-500" />
                                            {reason}
                                        </span>
                                    ))}
                                </div>

                                <Button className="w-full mt-2 group-hover:bg-indigo-600 transition-colors" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
