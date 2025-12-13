"use client";

import { MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TrendingCollege {
    _id: string;
    name: string;
    location: {
        city: string;
        state: string;
    };
    country: string;
    image: string;
    category: 'Traditional' | 'New-Gen' | 'International';
    trendingScore: number;
    metric: string; // e.g. "Highest: 1.5 CR+" or "Avg: ₹18.5 LPA" or "Global Rank #1"
    type: string; // Public/Private/University etc
}

interface TrendingCollegeCardProps {
    college: TrendingCollege;
    onClick: () => void;
}

export function TrendingCollegeCard({ college, onClick }: TrendingCollegeCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
            {/* Image Section */}
            <div className="relative h-32 w-full overflow-hidden">
                <img
                    src={college.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop"}
                    alt={college.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Trending Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <TrendingUp size={10} />
                    Trending
                </div>

                {/* Category Pill */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-indigo-900 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {college.category === 'Traditional' ? 'Indian' : college.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate mb-1 text-sm md:text-base group-hover:text-indigo-600 transition-colors">
                    {college.name}
                </h3>

                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <MapPin size={12} className="text-gray-400" />
                    {college.location.city}, {college.country}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Highlight</span>
                        <span className="text-xs font-bold text-emerald-600">{college.metric}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
