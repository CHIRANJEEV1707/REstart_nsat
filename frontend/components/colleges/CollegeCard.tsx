import { Button } from "@/components/ui/Button";
import { MapPin, Globe, Banknote, IndianRupee, Heart, ArrowRight } from "lucide-react";
import { College } from "@/types/college";
import { useCompare } from "@/context/CompareContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSavedColleges } from '@/hooks/useSavedColleges';
import { toast } from "sonner";


interface CollegeCardProps {
    college: College;
    variant: 'traditional' | 'international' | 'newgen';
    onClick: () => void;
}

export default function CollegeCard({ college, variant, onClick }: CollegeCardProps) {
    const { addToCompare, isInCompare, compareItems } = useCompare();
    // Auth
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    // Saved Colleges Hook
    const { isSaved, saveCollege, removeCollege, isSaving, isRemoving } = useSavedColleges();

    // ID Logic: Use _id as primary (MongoDB ObjectId), fallback to collegeId
    // CRITICAL FIX: Ensure we're using the correct unique identifier
    const effectiveId = college._id || college.collegeId;



    // Check if saved
    const isCollegeSaved = isSaved(effectiveId);

    // Save/Unsave Handler
    const handleToggleSave = (e: React.MouseEvent) => {
        // Critical: Stop propagation to prevent card click navigation
        e.stopPropagation();
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Please login to save colleges");
            router.push('/auth/login');
            return;
        }

        // Determine correct type for API
        const type = variant === 'traditional' ? 'indian' : variant;

        if (isCollegeSaved) {
            removeCollege({ id: effectiveId, type });
        } else {
            saveCollege({ id: effectiveId, type });
        }
    };

    // Styles based on variant
    const getCardStyle = () => {
        switch (variant) {
            case 'newgen':
                return "bg-slate-900 border-slate-800 text-white hover:border-indigo-500/50 hover:shadow-indigo-500/20";
            case 'international':
                return "bg-white border-blue-100 hover:border-blue-300 hover:shadow-blue-100";
            case 'traditional':
            default:
                return "bg-white border-gray-100 hover:border-violet-200 hover:shadow-md";
        }
    };

    const getBadge = () => {
        switch (variant) {
            case 'newgen':
                return <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">NEW-GEN</span>;
            case 'international':
                return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1"><Globe size={10} /> INTERNATIONAL</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold">TRADITIONAL</span>;
        }
    };

    const getCTA = () => {
        const linkHref = `/college/${effectiveId}`;
        switch (variant) {
            case 'newgen':
                return (
                    <Link href={linkHref} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0">
                            Explore Path <ArrowRight size={14} className="ml-2" />
                        </Button>
                    </Link>
                );
            case 'international':
                return (
                    <Link href={linkHref} className="w-full">
                        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                            View Details
                        </Button>
                    </Link>
                );
            default:
                return (
                    <Link href={linkHref} className="w-full">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            View Details
                        </Button>
                    </Link>
                );
        }
    };

    const getLocation = () => {
        if (variant === 'international') {
            return `${college.location.city || ''}, ${college.country || ''}`;
        }
        return `${college.location.city || ''}, ${college.location.state || ''}`;
    };

    if (variant === 'newgen') {
        return (
            <div className="group relative p-0 rounded-2xl border border-slate-800 bg-slate-950 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col h-full overflow-hidden">
                {/* 1. Top Section: Image with Overlay */}
                <div className="h-48 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                    {college.image ? (
                        <img
                            src={college.image}
                            alt={college.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 font-bold text-4xl">
                            {college.name?.[0] || 'C'}
                        </div>
                    )}

                    {/* Top Left Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/10">
                            Industry-Led
                        </span>
                    </div>

                    {/* Top Right Save */}
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleToggleSave}
                            disabled={isSaving || isRemoving}
                            className={`p-2 rounded-full backdrop-blur-md transition-all ${isCollegeSaved ? 'bg-rose-500/20 text-rose-500' : 'bg-black/40 text-white/70 hover:text-pink-500 hover:bg-black/60'}`}
                            title={isCollegeSaved ? "Remove from saved" : "Save college"}
                        >
                            <Heart size={16} className={isCollegeSaved ? "fill-current" : ""} />
                        </button>
                    </div>
                </div>

                {/* 2. Content Section */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                        <h3 className="font-bold text-xl text-white mb-1 leading-snug group-hover:text-indigo-400 transition-colors">
                            {college.name}
                        </h3>
                        <div className="flex items-center text-slate-400 text-sm">
                            <MapPin size={14} className="mr-1.5" />
                            {college.location.city}, {college.location.state}
                        </div>
                    </div>

                    {/* Positioning Tag */}
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                            {/* Logic to pick a tag or default */}
                            {college.tags?.[0] || "Industry-Led"}
                        </span>
                    </div>

                    {/* Fees / Model */}
                    {(college.fees && college.fees > 0) ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium mb-6">
                            <Banknote size={16} />
                            <span>
                                ₹{college.fees.toLocaleString()}
                            </span>
                        </div>
                    ) : null}

                    {/* Buttons */}
                    <div className="mt-auto grid grid-cols-2 gap-2">
                        <Link href={`/college/${effectiveId}`} className="w-full">
                            <Button
                                variant="ghost"
                                className="w-full text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-xs h-9"
                            >
                                View Details
                            </Button>
                        </Link>
                        <Link href={`/college/${effectiveId}`} className="w-full">
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-indigo-500/20 text-xs h-9 px-2"
                            >
                                Explore Program <ArrowRight size={12} className="ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`group relative p-4 rounded-xl border transition-all flex flex-col h-full ${getCardStyle()}`}>
            {/* Image Section */}
            <div className={`h-32 w-full rounded-lg mb-4 relative overflow-hidden flex items-center justify-center bg-gray-50`}>
                {college.image ? (
                    <img
                        src={college.image}
                        alt={college.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <span className="text-3xl font-bold text-gray-300">
                        {college.name?.[0] || 'C'}
                    </span>
                )}

                <div className="absolute top-2 left-2">
                    {getBadge()}
                </div>

                <div className="absolute top-2 right-2">
                    <button
                        onClick={handleToggleSave}
                        disabled={isSaving || isRemoving}
                        className={`p-1.5 rounded-full shadow-sm transition-colors ${isCollegeSaved ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200' : 'bg-white/80 text-gray-400 hover:text-pink-500 ring-1 ring-gray-100'}`}
                        title={isCollegeSaved ? "Remove from saved" : "Save college"}
                    >
                        <Heart size={14} className={isCollegeSaved ? "fill-current" : ""} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2 text-gray-900 group-hover:text-indigo-600">
                    <Link href={`/college/${effectiveId}`}>
                        {college.name}
                    </Link>
                </h3>

                <div className="flex items-center text-xs mb-3 text-gray-500">
                    <MapPin size={12} className="mr-1" />
                    {getLocation()}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {/* GAMIFICATION: Match Score Badge */}
                    {college.restart_score ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${college.restart_score >= 8
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : college.restart_score >= 6
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {Math.round(college.restart_score * 10)}% Match
                        </span>
                    ) : null}

                    {/* RESTART Score (Legacy but kept small) */}
                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                        Score: {college.restart_score ? college.restart_score.toFixed(1) : 'N/A'}
                    </span>

                    {variant === 'traditional' && college.badges?.[0] && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                            {college.badges[0]}
                        </span>
                    )}
                </div>

                {/* Fees / Highlights */}
                <div className="text-sm font-medium flex items-center text-gray-700">
                    {variant === 'international' ? (
                        <>
                            <Banknote size={14} className="mr-1.5" />
                            ${college.fees?.toLocaleString()} / yr
                        </>
                    ) : (
                        <>
                            <IndianRupee size={14} className="mr-1.5" />
                            {college.fees || college.placement_stats?.average_package || 'N/A'}
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-dashed border-gray-200/50 flex gap-2">
                <div className="flex-1" title={compareItems.length >= 3 && !isInCompare(effectiveId) ? "You can only compare up to 3 colleges. Remove one to add this." : ""}>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isInCompare(effectiveId)) {
                                return;
                            }
                            addToCompare({
                                collegeId: effectiveId,
                                collegeType: variant === 'traditional' ? 'indian' : variant,
                                name: college.name,
                                image: college.image
                            });
                        }}
                        disabled={isInCompare(effectiveId) || compareItems.length >= 3}
                        variant="outline"
                        className={`w-full border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors ${isInCompare(effectiveId) ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                    >
                        {isInCompare(effectiveId) ? '✓ Added' : '+ Compare'}
                    </Button>
                </div>
                <div className="flex-1">
                    <Link
                        href={`/college/${effectiveId}`}
                        className="w-full"
                    >
                        <Button className="w-full bg-[#0085ff] hover:bg-[#006bd1] text-white shadow-md hover:shadow-lg transition-all h-9 text-xs">
                            View Details <ArrowRight size={14} className="ml-1 flex-shrink-0" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
