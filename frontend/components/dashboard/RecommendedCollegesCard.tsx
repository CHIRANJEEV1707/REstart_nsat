"use client";

import { Sparkles, MapPin, Heart, ArrowRight, IndianRupee } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from "react";
import api from '@/lib/axios';
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

// --- Types & Contract ---
type RecommendedCollege = {
    id: string;
    name: string;
    slug: string;
    city: string;
    stateOrCountry: string;
    restartScore: number;    // 0–100
    annualFeesINR: number;   // raw number in INR
    type: "INTERNATIONAL" | "TRADITIONAL" | "NEW-GEN";
    imageUrl?: string;
};

// --- Helpers ---

function scoreToTenScale(score: number | undefined): string {
    if (score === undefined || score === null || score === 0) return "N/A";
    const validScore = score > 10 ? score / 10 : score;
    return validScore.toFixed(1);
}

function formatFeesINR(amount: number | undefined): string {
    if (!amount || amount === 0) return "Fees not available";
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
        console.log('[DEBUG] 🚀 Fetching recommendations for userId:', userId);

        const response = await api.get('/recommendations/dashboard');
        console.log('[DEBUG] ✅ Raw API Response:', response);
        console.log('[DEBUG] 📦 Response Data:', response.data);

        const data = response.data;

        // Backend returns `topMatches`
        const matches = data.topMatches || data.recommendations || [];
        // console.log('[DEBUG] 🎯 Extracted matches:', matches);
        // console.log('[DEBUG] 📊 Match count:', matches.length);

        if (matches.length === 0) {
            console.warn('[DEBUG] ⚠️ API returned ZERO matches!');
            console.log('[DEBUG] 🔍 Full response structure:', JSON.stringify(data, null, 2));
        }

        const mapped = matches.map((item: any) => {
            // console.log('[DEBUG] 🔄 Mapping college:', item);

            // Mapping based on Algorithm Doc & Controller
            const effectiveId = item.collegeId || item._id || item.id;
            const name = item.collegeName || item.name || "Unknown College";

            // Location
            const city = item.city || item.location?.city || "Unknown City";
            let stateOrCountry: string;
            if (item.country === 'India') {
                stateOrCountry = item.state || item.location?.state || 'India';
            } else {
                stateOrCountry = item.country || 'International';
            }

            // Scores & Fees
            const restartScore = item.restart_score || item.score || 0;
            const fees = item.fees || item.annualFees || item.tuition || 0;

            // Type Determination
            let type: RecommendedCollege["type"] = "TRADITIONAL";
            if (item.isNewGen || item.type === 'New-Gen') {
                type = "NEW-GEN";
            } else if (item.country && item.country !== 'India') {
                type = "INTERNATIONAL";
            }

            const result: RecommendedCollege = {
                id: effectiveId,
                name: name,
                slug: item.slug || effectiveId,
                city: city,
                stateOrCountry: stateOrCountry,
                restartScore: restartScore,
                annualFeesINR: fees,
                type: type,
                imageUrl: item.image || item.imageUrl
            };

            // console.log('[DEBUG] ✨ Mapped result:', result);
            // console.log('[DEBUG] ✨ Mapped result:', result);
            return result;
        });

        // Filter out invalid items
        const filtered = mapped.filter((c: RecommendedCollege) => {
            // Loosened Validation: Just need an ID and at least a name placeholder (even 'Unknown' is allowed for debugging so user sees SOMETHING)
            const isValid = c.id && c.name && c.name.trim() !== "";

            if (!isValid) {
                console.warn('[DEBUG] ⛔ Filtering out invalid college (missing ID or Name):', JSON.stringify(c, null, 2));
            }
            return isValid;
        });

        if (filtered.length === 0 && mapped.length > 0) {
            console.warn('[DEBUG] ⚠️ All fetched items were filtered out! Check property mapping.');
        }

        console.log('[DEBUG] ✅ Final filtered colleges:', filtered.length);
        return filtered;

    } catch (error: any) {
        console.error('[DEBUG] ❌ API Error:', error);
        console.error('[DEBUG] 🔍 Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
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
        if (!userId) {
            console.log('[DEBUG] RecommendedCollegesCard: No userId, skipping fetch');
            return;
        }

        console.log('[API] Attempting to fetch from:', '/recommendations/dashboard');
        console.log('[API] With userId:', userId);

        let mounted = true;
        setLoading(true);
        setError(false);

        getRecommendedCollegesForUser(userId)
            .then(data => {
                if (mounted) {
                    if (data.length === 0) {
                        console.warn('[DEBUG] Algorithm returned 0 matches');
                        console.log('[DEBUG] User likely needs to complete profile');
                        setColleges([]);
                    } else {
                        setColleges(data);
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (mounted) {
                    console.error('[DEBUG] Component Error:', err);
                    setError(true);
                    setLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [userId]);

    // Empty / No User State
    if (!userId) {
        return (
            <div className="w-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-semibold">Sign in for recommendations</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">
                    Sign in or complete your profile to see personalized college recommendations.
                </p>
                <Link href="/auth/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                </Link>
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
                    {/* Dev Mode Indicator */}
                    {/* <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">DEBUG ACTIVE</span> */}
                </h2>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center justify-center">
                    Failed to load recommendations. Please refresh the page.
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[420px] rounded-2xl border border-gray-100 bg-white overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-5 space-y-4">
                                <Skeleton className="h-6 w-3/4 rounded-md" />
                                <Skeleton className="h-4 w-1/2 rounded-md" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <div className="pt-6 flex gap-3 mt-auto">
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State (Loaded but no results) */}
            {!loading && !error && colleges.length === 0 && (
                <div className="w-full py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4 ring-1 ring-indigo-100">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-xl mb-2">No recommendations yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm mb-6 px-4">
                        We need a bit more info to find your perfect match. Update your profile preferences to get started.
                    </p>
                    {/* Debug Hint */}
                    <div className="hidden border border-gray-200 bg-gray-50 p-2 text-xs text-gray-500 rounded mt-4 max-w-xs text-left">
                        <p className="font-bold">Debugging Info:</p>
                        <p>User ID: {userId.slice(0, 8)}...</p>
                        <p>Check console for [DEBUG] logs.</p>
                    </div>
                    <Link href="/profile">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                            Update Profile
                        </Button>
                    </Link>
                </div>
            )}

            {/* Data Grid */}
            {!loading && !error && colleges.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colleges.map((college) => {
                        const styles = getTypeStyles(college.type);
                        const { cta, ctaVariant } = getCtaConfig(college.type);

                        // Formatting
                        const feeDisplay = formatFeesINR(college.annualFeesINR);
                        const scoreDisplay = scoreToTenScale(college.restartScore);
                        const locationDisplay = `${college.city}, ${college.stateOrCountry}`;
                        const fallbackImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80"; // Default Uni Image

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
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = fallbackImage;
                                            }}
                                        />
                                    ) : (
                                        // Fallback Gradient Design
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center relative">
                                            <span className="text-white/20 text-9xl font-bold absolute -bottom-8 -right-4 select-none">
                                                {college.name && college.name.length > 0 ? college.name.charAt(0) : 'C'}
                                            </span>
                                            <span className="text-white font-bold text-5xl relative z-10 shadow-sm">
                                                {college.name && college.name.length > 0 ? college.name.charAt(0) : 'C'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />

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
                                    <h3
                                        className="font-bold text-lg leading-tight text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[1.5em]"
                                        title={college.name}
                                    >
                                        <Link href={`/college/${college.slug}`}>
                                            {college.name}
                                        </Link>
                                    </h3>

                                    {/* Location */}
                                    <div className="flex items-center text-xs font-medium text-gray-500 mb-4 truncate" title={locationDisplay}>
                                        <MapPin size={13} className="mr-1.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{locationDisplay}</span>
                                    </div>

                                    {/* Metrics Pills */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                            RESTART Score: <span className="text-indigo-900">{scoreDisplay}</span>
                                        </span>
                                    </div>

                                    {/* Fees */}
                                    <div className="mt-auto flex items-baseline gap-1 text-gray-700 text-sm font-medium mb-6">
                                        <div className="flex items-center text-gray-400">
                                            <IndianRupee size={15} />
                                        </div>
                                        <span className={`font-bold ${college.annualFeesINR > 0 ? "text-lg text-gray-900" : "text-sm text-gray-500"}`}>
                                            {feeDisplay}
                                        </span>
                                        {college.annualFeesINR > 0 && (
                                            <span className="text-gray-400 text-xs font-normal">/ yr</span>
                                        )}
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
