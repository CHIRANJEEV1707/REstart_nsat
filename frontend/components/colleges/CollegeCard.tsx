import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { College } from '@/types/college';
import { ArrowUpRight, IndianRupee, MapPin, Check, Plus } from 'lucide-react';
import Image from 'next/image';
import { useComparison } from "@/context/ComparisonContext";
import { useDashboard } from '@/context/DashboardContext';
import { useState, useMemo } from 'react';


// Format currency helper
const formatFees = (fees: number, currency: string = 'INR') => {
    if (currency === 'INR') {
        return `₹${(fees / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumSignificantDigits: 3 }).format(fees);
};

export default function CollegeCard({ college }: { college: College }) {
    const { addToCompare, removeFromCompare, isInCompare, selectedColleges } = useComparison();
    const { openCollegeDetails } = useDashboard();
    const isAdded = isInCompare(college._id);
    const isMax = selectedColleges.length >= 3;
    const [imageError, setImageError] = useState(false);

    // Robust Image Logic:
    // 1. If we have a valid remote image and no error, use it.
    // 2. If we have a local image path (from our dummy logic), use it.
    // 3. Fallback to a deterministic dummy image based on college ID to keep it consistent.
    const finalImageUrl = useMemo(() => {
        if (imageError || !college.image) {
            return "https://placehold.co/600x400";
        }
        return college.image;
    }, [college.image, imageError]);

    return (
        <Card className="group relative overflow-hidden h-full flex flex-col border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 rounded-xl bg-white">
            {/* 1. Top Image Section */}
            <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                <Image
                    src={finalImageUrl}
                    alt={college.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                    onError={() => setImageError(true)}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* 2. Badge & Action Row (Overlaid on Image top) */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-1.5 items-start">
                        {college.financialSupportPercent !== undefined && college.financialSupportPercent > 0 && (
                            <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-600 backdrop-blur-sm border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                                {college.financialSupportPercent}% FS
                            </Badge>
                        )}
                        {college.tags?.[0] && (
                            <Badge variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-md text-[10px] font-medium border-0 px-2 py-0.5 shadow-sm">
                                {college.tags[0]}
                            </Badge>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (isAdded) {
                                removeFromCompare(college._id);
                            } else {
                                addToCompare({ _id: college._id, name: college.name, type: 'indian' });
                            }
                        }}
                        disabled={!isAdded && isMax}
                        className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${isAdded
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-white/80 border-white/40 text-gray-600 hover:bg-white hover:text-indigo-600'
                            } ${(!isAdded && isMax) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isAdded ? "Remove from compare" : isMax ? "Compare list full (3/3)" : "Add to compare"}
                    >
                        {isAdded ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                    </button>
                </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
                {/* 3. College Identity Section */}
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors" title={college.name}>
                            {college.name}
                        </h3>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 font-medium">
                        <MapPin size={12} className="mr-1 text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={`${college.location.city}, ${college.location.state}, ${college.country}`}>
                            {college.location.city}, {college.location.state}, {college.country}
                        </span>
                    </div>
                </div>

                {/* 4. Key Metrics Section */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Annual Fees</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {formatFees(college.fees, college.currency || 'INR')}
                        </span>
                    </div>

                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Exams</span>
                        <div className="flex items-center justify-end gap-1 text-sm font-semibold text-gray-900">
                            <span className="truncate max-w-[80px]" title={college.exams_required.join(', ')}>
                                {college.exams_required?.[0] || 'Merit'}
                            </span>
                            {college.exams_required?.length > 1 && (
                                <span className="text-gray-400 text-xs font-normal">+{college.exams_required.length - 1}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. Primary CTA */}
                <button
                    onClick={() => openCollegeDetails(college._id, 'indian')}
                    className="w-full h-9 flex items-center justify-center gap-2 bg-gray-50 hover:bg-indigo-600 text-gray-700 hover:text-white text-xs font-bold rounded-lg transition-all duration-300 group/btn"
                >
                    View Details
                    <ArrowUpRight size={14} className="opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                </button>
            </CardContent>
        </Card>
    );
}
