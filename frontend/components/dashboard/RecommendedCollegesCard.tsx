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
        queryKey: ['recommendations'],
        // Fetch recommendations from our new endpoint
        queryFn: async () => {
            const res = await api.get('/colleges/recommendations');
            return res.data;
        },
        staleTime: 5 * 60 * 1000 // 5 mins
    });

    const recommendations = response?.recommendations || response?.data || [];

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
                <h3 className="font-semibold text-gray-900">No Recommendations Yet</h3>
                <p className="text-sm text-gray-500 mt-1">Complete your profile to get personalized college suggestions.</p>
                <Button className="mt-4" variant="outline" size="sm">Update Profile</Button>
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
                {/* <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 3).map((college: any) => (
                    <Card
                        key={college._id}
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-indigo-50/50 bg-white"
                        onClick={() => {
                            // Determine viewType from type/category returned by backend
                            let viewType: 'indian' | 'international' | 'newgen' = 'indian';
                            if (college.type === 'New-Gen') viewType = 'newgen';
                            if (college.type === 'International' || college.country !== 'India') viewType = 'international';
                            openCollegeDetails(college._id, viewType);
                        }}
                    >
                        {/* Image Header with Fit Score */}
                        <div className="relative h-40">
                            <Image
                                src={college.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop"}
                                alt={college.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            {/* Fit Score Badge */}
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm bg-opacity-90">
                                <Sparkles size={11} fill="currentColor" />
                                {college.fitScore}% Match
                            </div>

                            <div className="absolute bottom-3 left-4 right-4">
                                <h3 className="font-bold text-white text-lg leading-tight truncate">
                                    {college.name}
                                </h3>
                                <div className="flex items-center gap-1 text-gray-200 text-xs mt-1">
                                    <MapPin size={12} />
                                    {college.location.city}, {college.country}
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 space-y-3">
                            {/* AI Reason */}
                            <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100/50">
                                <div className="flex gap-2">
                                    <div className="mt-0.5">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    </div>
                                    <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                                        <span className="font-bold">Why:</span> {college.matchReason}
                                    </p>
                                </div>
                            </div>

                            {/* Tags/Features */}
                            <div className="flex flex-wrap gap-2">
                                {college.allReasons?.slice(0, 2).map((reason: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                        {reason}
                                    </span>
                                ))}
                            </div>

                            <Button className="w-full mt-2 group-hover:bg-indigo-600 transition-colors" size="sm">
                                View Details
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
