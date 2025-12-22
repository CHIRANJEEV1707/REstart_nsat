"use client";

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Globe, Mail, Phone, Share2, Heart } from 'lucide-react';
import Image from 'next/image';
import { useDashboard } from '@/context/DashboardContext';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export function CollegeDetailsView() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { toggleSaveCollege, savedColleges } = useDashboard();
    const [imageError, setImageError] = useState(false);

    const goBack = () => router.back();

    // 1. Fetch College Details
    const { data: college, isLoading, isError } = useQuery({
        queryKey: ['college', id],
        queryFn: async () => {
            if (!id) return null;

            console.log("Fetching college from:", `/colleges/${id}`);
            const res = await api.get(`/colleges/${id}`);
            const data = res.data.data;

            // Determine type from response if available, or infer
            const type = data.type || (data.country && data.country !== 'India' ? 'international' : 'indian');

            // Normalize data structure based on type is handled by backend now mostly, but ensuring frontend consistency:
            if (type === 'international' || (data.country && data.country !== 'India')) {
                return {
                    ...data,
                    _id: data._id,
                    name: data.name,
                    image: data.image || `https://flagcdn.com/w1600/${data.country?.slice(0, 2).toLowerCase() || 'us'}.png`,
                    location: {
                        city: data.location?.city || data.city || 'Unknown',
                        state: data.location?.state || data.country || 'International',
                        country: data.country
                    },
                    fees: data.fees || data.tuition_fee_annual,
                    currency: 'INR',
                    exams_required: data.exams_required || data.entrance_exams || [],
                    type: 'international'
                };
            }

            if (type === 'newgen') {
                return {
                    ...data,
                    type: 'newgen'
                };
            }

            return { ...data, type: 'indian' };
        },
        enabled: !!id,
    });

    const isSaved = savedColleges.includes(id);

    // 3. Save/Unsave Handler
    const handleSave = () => {
        if (!college) return;
        toggleSaveCollege(id, college.type || 'indian');
    };


    if (isLoading) {
        return (
            <div className="p-8 space-y-6 animate-pulse w-full max-w-7xl mx-auto">
                <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 w-full bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (isError || !college) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <p className="text-gray-500 mb-4">Failed to load college details.</p>
                <button
                    onClick={goBack}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const finalImageUrl = (imageError || !college.image)
        ? "https://placehold.co/1200x400"
        : college.image;

    const formatFees = (fees: number, currency: string = 'INR') => {
        if (currency === 'INR') {
            return `₹${(fees / 100000).toFixed(1)} Lakhs / Year`;
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumSignificantDigits: 3 }).format(fees);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6 pb-20"
        >
            {/* 1. Navigation Header */}
            <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md py-4 border-b border-gray-100 flex items-center justify-between mb-2">
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all border
                            ${isSaved
                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                                : 'bg-white border-gray-200 text-gray-700 hover:text-rose-600 hover:border-rose-200'
                            }
                        `}
                    >
                        <Heart size={18} className={isSaved ? "fill-current" : ""} />
                        {isSaved ? "Saved" : "Save College"}
                    </button>

                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* 2. Hero Section */}
            <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-lg group">
                <Image
                    src={finalImageUrl}
                    alt={college.name || "College Image"}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {college.financialSupportPercent !== undefined && college.financialSupportPercent > 0 && (
                            <Badge className="bg-emerald-500 text-white border-0">
                                {college.financialSupportPercent}% Financial Support
                            </Badge>
                        )}
                        {college.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 shadow-sm">{college.name}</h1>
                    <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            {college.location.city}, {college.location.state}, {college.country}
                        </span>
                        {college.type && (
                            <span className="hidden md:inline px-2 py-0.5 bg-white/20 rounded text-xs backdrop-blur-sm self-center">
                                {college.type}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Key Info & Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About the specific details</h2>
                        <p className="text-gray-600 leading-relaxed text-base">
                            {college.description || `Welcome to ${college.name}. A premier institution dedicated to excellence in education and research.Located in the vibrant city of ${college.location.city}, we offer a wide range of programs designed to prepare students for successful careers.`}
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-3xl border p-4 bg-[#0085ff]/10 border-[#0085ff]/20 flex flex-col items-center justify-center text-center">
                            <span className="text-[#0085ff] font-bold text-xl">{college.restart_score ? college.restart_score.toFixed(1) : "N/A"}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">RESTART Score</span>
                        </div>
                        <Card className="p-4 bg-emerald-50/50 border-emerald-100 flex flex-col items-center justify-center text-center">
                            <span className="text-emerald-600 font-bold text-lg">{college.accreditation || "NAAC A++"}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Grade</span>
                        </Card>
                        <Card className="p-4 bg-amber-50/50 border-amber-100 flex flex-col items-center justify-center text-center">
                            <span className="text-amber-600 font-bold text-lg">94%</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Placement</span>
                        </Card>
                        <Card className="p-4 bg-blue-50/60 border-blue-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-[#0085ff] font-bold text-lg">{college.roi ? `${college.roi}x` : "N/A"}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">4-Year ROI</span>
                        </Card>
                    </div>

                    {/* Programs & Exams */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Admission Criteria</h2>
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Accepted Exams</h3>
                                <div className="flex flex-wrap gap-2">
                                    {college.exams_required?.map((exam: string) => (
                                        <Badge key={exam} className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 text-sm">
                                            {exam}
                                        </Badge>
                                    )) || <span className="text-gray-500 italic">Merit Based</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Study Abroad Section (International Only) */}
                    {college.type === 'international' && college.study_abroad_info && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-blue-500" />
                                Study Abroad Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Visa */}
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Visa Requirements</h3>
                                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                        {college.study_abroad_info.visa_requirements?.map((req: string, i: number) => (
                                            <li key={i}>{req}</li>
                                        )) || <li>Check embassy website</li>}
                                    </ul>
                                </div>

                                {/* Language */}
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">English Proficiency</h3>
                                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                        {college.study_abroad_info.english_proficiency?.map((req: string, i: number) => (
                                            <li key={i}>{req}</li>
                                        )) || <li>IELTS/TOEFL required</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Scholarships */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">Available Scholarships</h3>
                                <div className="flex flex-wrap gap-2">
                                    {college.study_abroad_info.scholarships_available?.map((sch: string, i: number) => (
                                        <Badge key={i} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                            {sch}
                                        </Badge>
                                    )) || <span className="text-gray-500 text-sm">Contact university for aid</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admission Process (if available) */}
                    {college.admission_process && college.admission_process.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Admission Process</h2>
                            <div className="space-y-4">
                                {college.admission_process.map((step: string, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-gray-700 font-medium">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Sticky Sidebar Info */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">

                        {/* Fees Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-medium text-sm mb-1">Total Annual Fees</h3>
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                {college.type === 'newgen' && college.avg_package
                                    ? <span className="text-emerald-600">{college.avg_package} <span className="text-sm text-gray-500 font-normal">Avg Package</span></span>
                                    : formatFees(college.fees, college.currency)
                                }
                            </div>
                            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg mb-3">
                                Apply Now
                            </button>
                            <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all">
                                Download Brochure
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                {college.contact?.website && (
                                    <a href={college.contact.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                                        <Globe size={16} />
                                        <span className="truncate">Official Website</span>
                                    </a>
                                )}
                                {college.contact?.email && (
                                    <a href={`mailto:${college.contact.email} `} className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                                        <Mail size={16} />
                                        <span className="truncate">{college.contact.email}</span>
                                    </a>
                                )}
                                {college.contact?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} />
                                        <span>{college.contact.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </motion.div>
    );
}
