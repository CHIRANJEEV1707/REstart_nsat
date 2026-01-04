"use client";

import { Sparkles, MapPin, Heart, ArrowRight, IndianRupee } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from "react";
import api from '@/lib/axios';
import { Skeleton } from "@/components/ui/Skeleton";

// --- Types & Contract ---
type RecommendedCollege = {
    id: string;
    name: string;
    slug: string;
    city: string;
    stateOrCountry: string;
    restartScore: number;    // 0–100 or 0-10 normalized
    annualFeesINR: number;   // raw number in INR
    type: "INTERNATIONAL" | "TRADITIONAL" | "NEW-GEN";
    imageUrl?: string;
};

// --- Helpers ---

function scoreToTenScale(score: number): string {
    // Input might be 0-10 or 0-100. Normalize to 0-10 string with 1 decimal.
    // Assuming backend might send 0-100 based on previous context, but let's be safe.
    // If score > 10, assume it's out of 100.
    const normalized = score > 10 ? score / 10 : score;
    return normalized.toFixed(1);
}

function formatFeesINR(amount: number): string {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-IN').format(amount);
}

function getTypeStyles(type: RecommendedCollege["type"]): string {
    switch (type) {
        case "INTERNATIONAL":
            return "bg-blue-50 text-blue-700";
        case "NEW-GEN":
            return "bg-indigo-50 text-indigo-700";
        case "TRADITIONAL":
        default:
            return "bg-green-50 text-green-700";
    }
}

function getCtaConfig(type: RecommendedCollege["type"]): { cta: string; ctaVariant: "primary" | "secondary" } {
    if (type === "NEW-GEN") {
        return { cta: "Explore Path", ctaVariant: "primary" };
    }
    return { cta: "View Details", ctaVariant: "secondary" };
}

// --- API Adapter ---

async function getRecommendedCollegesForUser(userId: string): Promise<RecommendedCollege[]> {
    try {
        // Calling the verified backend endpoint
        const response = await api.get('/recommendations/dashboard');
        const data = response.data;

        // Map backend response (NormalizedCollege[]) to UI contract (RecommendedCollege[])
        // Ensure we handle the "topMatches" structure if that's what backend returns
        const matches = data.topMatches || [];

        return matches.map((item: any) => {
            // Determine type safely
            let safeType: RecommendedCollege["type"] = "TRADITIONAL";
            if (item.type === 'New-Gen' || item.isNewGen) safeType = "NEW-GEN";
            else if (item.type === 'International' || (item.country && item.country !== 'India')) safeType = "INTERNATIONAL";

            return {
                id: item._id,
                name: item.name,
                slug: item._id, // Using ID as slug for now as per app pattern
                city: item.location?.city || item.city || "Unknown",
                stateOrCountry: item.country === 'India'
                    ? (item.location?.state || item.state || 'India')
                    : item.country,
                restartScore: item.restart_score || 0,
                annualFeesINR: item.fees || 0,
                type: safeType,
                imageUrl: item.image
            };
        });
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        throw error;
    }
}

// --- Component ---

interface RecommendedCollegesCardProps {
    userId?: string;
}

export function RecommendedCollegesCard({ userId }: RecommendedCollegesCardProps) {
    const [colleges, setColleges] = useState<RecommendedCollege[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!userId) return;

        let mounted = true;
        setLoading(true);
        setError(false);

        getRecommendedCollegesForUser(userId)
            .then(data => {
                if (mounted) {
                    setColleges(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [userId]);

    // Empty / No User State
    if (!userId) {
        return (
            <div className="w-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-semibold">Sign in for recommendations</h3>
                <p className="text-gray-500 text-sm mt-1">
                    Sign in or complete your profile to see personalized college recommendations.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Recommended for You
                </h2>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                    Failed to load recommendations. Please try refreshing.
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[380px] rounded-2xl border border-gray-100 bg-white overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-5 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State (loaded but no results) */}
            {!loading && !error && colleges.length === 0 && (
                <div className="w-full py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="inline-flex p-3 bg-gray-50 rounded-full mb-4">
                        <Sparkles className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">No recommendations yet</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
                        Update your profile, goals, and budget preferences to get better matches tailored to you.
                    </p>
                </div>
            )}

            {/* Data Grid */}
            {!loading && !error && colleges.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colleges.map((college) => {
                        const styles = getTypeStyles(college.type);
                        const { cta, ctaVariant } = getCtaConfig(college.type);

                        return (
                            <div
                                key={college.id}
                                className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Image & Badge Area */}
                                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                    {/* Real Image or Fallback */}
                                    {college.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={college.imageUrl}
                                            alt={college.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-4xl">
                                            {college.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                                    {/* Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase backdrop-blur-md bg-white/90 ${styles} shadow-sm border border-white/20`}>
                                            {college.type}
                                        </span>
                                    </div>

                                    {/* Save Button */}
                                    <div className="absolute top-3 right-3">
                                        <button
                                            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm transition-colors"
                                            title="Save college"
                                        >
                                            <Heart size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="flex flex-col flex-1 p-5">
                                    {/* Title */}
                                    <h3 className="font-bold text-lg leading-tight text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                        <Link href={`/college/${college.slug}`} className="line-clamp-2">
                                            {college.name}
                                        </Link>
                                    </h3>

                                    {/* Location */}
                                    <div className="flex items-center text-xs font-medium text-gray-500 mb-4">
                                        <MapPin size={13} className="mr-1.5 text-gray-400" />
                                        {college.city}, {college.stateOrCountry}
                                    </div>

                                    {/* Metrics Pills */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                            RESTART Score: <span className="text-indigo-900">{scoreToTenScale(college.restartScore)}</span>
                                        </span>
                                    </div>

                                    {/* Fees */}
                                    <div className="mt-auto flex items-baseline gap-1 text-gray-700 text-sm font-medium mb-5">
                                        <div className="flex items-center text-gray-400">
                                            <IndianRupee size={14} />
                                        </div>
                                        <span className="text-gray-900 font-bold text-base">{formatFeesINR(college.annualFeesINR)}</span>
                                        <span className="text-gray-400 text-xs font-normal">/ yr</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-gray-200">
                                        <button className="flex items-center justify-center w-full h-10 px-4 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                                            + Compare
                                        </button>

                                        <Link href={`/college/${college.slug}`} className="w-full">
                                            <button className={`flex items-center justify-center w-full h-10 px-4 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all ${ctaVariant === 'primary' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                {cta} {ctaVariant === 'primary' && <ArrowRight size={14} className="ml-1.5" />}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
