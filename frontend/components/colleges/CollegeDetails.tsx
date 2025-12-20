"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { MapPin, Wallet, Sparkles, GraduationCap, Globe, Building2, CheckCircle2, ArrowRight, Share2, Heart } from "lucide-react";
import { useDashboard } from '@/context/DashboardContext';
import Image from 'next/image';
import { useCollegeRank } from '@/hooks/useCollegeRank';

interface UnifiedCollege {
    _id: string;
    name: string;
    type: 'Indian' | 'International' | 'New-Gen';
    location: {
        city: string;
        state?: string;
        country: string;
    };
    fees: number;
    currency?: string;
    restart_score: number;
    exams_required: string[];
    badges: string[];
    description: string;
    website: string;
    image: string;
    why?: string[];
    placement_stats?: {
        average_package?: string;
        highest_package?: string;
    };
    // Type specific
    cohortDetails?: any;
    curriculumFocus?: string[];
    study_abroad_info?: any;
}

export default function CollegeDetails({ id, onBack }: { id: string; onBack: () => void }) {
    const { toggleSaveCollege, savedColleges } = useDashboard();

    // Fetch College Data
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['college-details', id],
        queryFn: async () => {
            const res = await api.get(`/colleges/${id}`);
            return res.data;
        }
    });

    // Fetch Rank
    const { data: rankData, isLoading: isRankLoading } = useCollegeRank(id);

    const college = response?.data as UnifiedCollege;
    const isSaved = savedColleges?.includes(id);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8 p-6 max-w-5xl mx-auto">
                <Skeleton className="h-[300px] w-full rounded-3xl" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        );
    }

    if (isError || !college) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">College Not Found</h2>
                <Button onClick={onBack} variant="outline" className="mt-4">Go Back</Button>
            </div>
        );
    }

    // derived state
    const isInternational = college.type === 'International';
    const isNewGen = college.type === 'New-Gen';

    // Restart Score Color
    const rScore = college.restart_score || 0;
    const scoreColor = rScore >= 9.0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
        : rScore >= 7.5 ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
            : 'text-amber-600 bg-amber-50 border-amber-200';

    return (
        <div className="animate-in fade-in duration-500 pb-20 bg-gray-50/50 min-h-screen">
            {/* HERO SECTION */}
            <div className="relative h-[350px] w-full group">
                <Image
                    src={college.image}
                    alt={college.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                <div className="absolute top-6 left-6 z-10">
                    <Button onClick={onBack} variant="secondary" size="sm" className="bg-white/90 backdrop-blur hover:bg-white text-gray-900 gap-2 rounded-full">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3 text-white">
                            <div className="flex items-center gap-3">
                                <Badge className={`text-sm py-1 px-3 border-none ${isInternational ? 'bg-blue-600' : isNewGen ? 'bg-violet-600' : 'bg-orange-600'
                                    } hover:bg-opacity-90`}>
                                    {college.type}
                                </Badge>
                                {!isRankLoading && rankData && (
                                    <Badge className="text-sm py-1 px-3 border-none bg-indigo-600 hover:bg-indigo-700">
                                        #{rankData.rank} in {rankData.category}
                                    </Badge>
                                )}
                                {college.location.city && (
                                    <span className="flex items-center gap-1.5 text-sm font-medium bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {college.location.city}, {college.location.country}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
                                {college.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => toggleSaveCollege(college._id)}
                                variant="secondary"
                                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white p-0"
                            >
                                <Heart className={`w-6 h-6 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </Button>
                            <Button className="h-12 rounded-full px-8 text-base bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-xl border-none">
                                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 grid md:grid-cols-3 gap-8">

                {/* PRIMARY COLUMN */}
                <div className="md:col-span-2 space-y-8">

                    {/* KEY STATS CARD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">RESTART Score</p>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${scoreColor.split(' ')[0]}`}>
                                {college.restart_score} <span className="text-xs font-normal text-gray-400">/ 10</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Annual Fees</p>
                            <div className="text-xl font-bold text-gray-900 truncate">
                                {college.currency === 'USD' ? '$' : '₹'}{college.fees?.toLocaleString()}
                            </div>
                        </div>
                        {college.placement_stats?.average_package && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Avg Package</p>
                                <div className="text-xl font-bold text-gray-900">
                                    {college.placement_stats.average_package}
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Exams</p>
                            <div className="text-sm font-semibold text-gray-900 leading-tight">
                                {college.exams_required.length > 0 ? college.exams_required.join(', ') : 'None'}
                            </div>
                        </div>
                    </div>

                    {/* WHY THIS COLLEGE */}
                    {college.why && college.why.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                Why we recommend this
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {college.why.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-indigo-100 text-sm font-medium text-indigo-700">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ABOUT */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About the Institute</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {college.description}
                        </p>

                        {college.badges && college.badges.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {college.badges.map((badge, idx) => (
                                    <Badge key={idx} variant="outline" className="px-3 py-1 bg-gray-50 text-gray-600 font-normal">
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* NEW-GEN CURRICULUM (Conditional) */}
                    {isNewGen && college.curriculumFocus && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-violet-600" />
                                Curriculum Focus
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {college.curriculumFocus.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INTERNATIONAL REQUIREMENTS (Conditional) */}
                    {isInternational && college.study_abroad_info && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-600" />
                                Study Abroad Requirements
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">English Proficiency</h4>
                                    <div className="flex gap-2">
                                        {college.study_abroad_info.english_proficiency?.map((test: string, idx: number) => (
                                            <Badge key={idx} variant="secondary">{test}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
                                    <strong>Visa:</strong> The {college.location.country} typically requires {college.study_abroad_info.visa_requirements?.[0] || "Student Visa"}.
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* SIDEBAR COLUMN */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-semibold text-gray-900 mb-6">Quick Actions</h3>

                        <Button className="w-full mb-3 bg-gray-900 hover:bg-gray-800 shadow-md h-11" onClick={() => window.open(college.website, '_blank')}>
                            Visit Official Website <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline" className="w-full h-11 border-gray-300">
                            Download Brochure
                        </Button>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Location</h4>
                            <div className="flex items-start gap-3 mt-3">
                                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{college.location.city}</p>
                                    <p className="text-xs text-gray-500">{college.location.state ? `${college.location.state}, ` : ''}{college.location.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
