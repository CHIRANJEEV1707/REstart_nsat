"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Heart, Share2, MapPin, Award, TrendingUp, DollarSign, Building2 } from 'lucide-react';

export default function CollegeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();

    const isCompared = isInCompare(id as string);

    const handleCompare = () => {
        if (isCompared) {
            removeFromCompare(id as string);
        } else {
            addToCompare({ collegeId: id as string, name: college?.name || 'College', collegeType: 'indian' });
        }
    };

    // Auth
    const { user } = useAuth();
    // Handle both populated (objects) and unpopulated (strings) saved_colleges
    const isSaved = user?.saved_colleges?.some((c: any) => (typeof c === 'string' ? c : c._id) === id);

    const queryClient = useQueryClient();
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (isSaved) await api.delete(`/saved/${id}`);
            else await api.post('/saved', { collegeId: id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth-user'] });
            queryClient.invalidateQueries({ queryKey: ['saved'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });

    const handleSave = () => {
        if (!user) return window.location.href = '/auth/login';
        saveMutation.mutate();
    };

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['college', id],
        queryFn: async () => {
            const res = await api.get(`/colleges/${id}`);
            return res.data;
        },
        enabled: !!id,
        staleTime: 0, // Always fetch fresh
    });

    const college = response?.data;
    const isInternational = college?.country && college.country !== 'India';

    if (isLoading) return <LoadingState />;
    if (isError || !college) return <ErrorState />;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sticky Dashboard Top Bar */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500 font-medium hidden sm:block">College Details</span>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className={`h-9 px-4 rounded-lg bg-white ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                    >
                        <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} /> {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCompare}
                        className={`h-9 px-4 rounded-lg bg-white ${isCompared ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                    >
                        {isCompared ? "✓ Added" : "+ Compare"}
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Hero Header - Minimal */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {isInternational && (
                                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                                        International
                                    </Badge>
                                )}
                                <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                                    {college.type || "Institute"}
                                </Badge>
                                {college.badges?.slice(0, 2).map((b: string) => (
                                    <Badge key={b} variant="outline" className="text-gray-600 border-gray-200 rounded-md px-2 py-0.5 text-xs">
                                        {b}
                                    </Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                {college.name}
                            </h1>
                            <div className="flex items-center text-gray-500 text-sm md:text-base">
                                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                                {college.location?.city}, {college.location?.state}
                                {isInternational && <span className="mx-2">•</span>}
                                {isInternational && college.country}
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            {/* Placeholder for college logo or simple score badge if needed, kept minimal as requested */}
                            <div className="flex flex-col items-end">
                                <div className="text-sm text-gray-500 font-medium mb-1">RESTART Score</div>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900">{college.restart_score ? college.restart_score.toFixed(1) : 'N/A'}</span>
                                    <span className="text-lg text-gray-400 font-medium">/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Stats Grid - Dashboard Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {/* RESTART Score Card (Replaced Ranking) */}
                    <div className="rounded-xl border p-4 bg-[#0085ff]/10 border-[#0085ff]/20 flex flex-col items-center justify-center text-center h-full">
                        <span className="text-[#0085ff] font-bold text-2xl">
                            {college.restart_score ? college.restart_score.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
                            RESTART Score
                        </span>
                    </div>
                    <DashboardStatCard
                        icon={<DollarSign className="w-5 h-5 text-green-600" />}
                        label="Avg Package / Salary"
                        value={college.placement_stats?.average_package || "N/A"}
                        subtext="Annual"
                    />
                    <DashboardStatCard
                        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                        label="ROI"
                        value={college.roi ? `${college.roi}x` : "N/A"}
                        subtext="4-Year Return"
                    />
                    <DashboardStatCard
                        icon={<Building2 className="w-5 h-5 text-orange-600" />}
                        label="Institute Type"
                        value={college.type}
                        subtext="Classification"
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Sticky Tabs */}
                        <div className="sticky top-[73px] z-10 bg-gray-50/50 backdrop-blur-sm pt-2 mb-6 border-b border-gray-200">
                            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-px">
                                {['overview', 'fees', 'exams', 'admission', ...(isInternational ? ['visa', 'scholarships'] : [])].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${activeTab === tab
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <section>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Institute</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {college.description || "No description available for this college."}
                                        </p>
                                    </section>

                                    {/* Additional Overview Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights</h4>
                                            <ul className="space-y-2">
                                                {college.badges?.map((badge: string, i: number) => (
                                                    <li key={i} className="flex items-start text-sm text-gray-600">
                                                        <span className="mr-2 text-indigo-500">•</span> {badge}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'fees' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">Fee Structure</h3>
                                    </div>

                                    <div className="p-5 bg-gray-50/80 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-gray-600 font-medium">Annual Tuition Fee</span>
                                            <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                                ₹{(college.fees).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-px bg-gray-200 my-4"></div>
                                        <p className="text-sm text-gray-500">
                                            * Fees are approximate and subject to change. Scholarships available for meritorious students.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'exams' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900">Exams Accepted</h3>
                                    <div className="grid gap-3">
                                        {college.exams_required?.map((ex: string) => (
                                            <div key={ex} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                                                <span className="font-semibold text-gray-900">{ex}</span>
                                                <Link href="/exams" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View Exam Details →</Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'admission' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900">Admission Process</h3>
                                    <div className="relative border-l border-gray-200 ml-3 space-y-8 py-2">
                                        {college.admission_process?.map((step: string, i: number) => (
                                            <div key={i} className="pl-8 relative">
                                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                                                <h4 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide text-indigo-600">Step {i + 1}</h4>
                                                <p className="text-gray-700 font-medium">{step}</p>
                                                <p className="text-sm text-gray-500 mt-1">Complete this step to proceed.</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'scholarships' && isInternational && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900">Scholarships</h3>
                                    <div className="grid gap-4">
                                        {college.study_abroad_info?.scholarships_available?.map((sch: string, i: number) => (
                                            <div key={i} className="p-4 border border-indigo-50 bg-indigo-50/30 rounded-lg">
                                                <p className="font-semibold text-gray-900 mb-1">{sch}</p>
                                                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Available for International Students</p>
                                            </div>
                                        )) || <p className="text-gray-500 italic">No specific scholarship information available.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'visa' && isInternational && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900">Visa Requirements</h3>
                                    <ul className="space-y-3">
                                        {college.study_abroad_info?.visa_requirements?.map((req: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg text-sm">
                                                <span className="text-indigo-500 font-bold">•</span>
                                                {req}
                                            </li>
                                        )) || <p className="text-gray-500 italic">No specific visa information available.</p>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Sticky Call to Action */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-28 space-y-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Application Status</h3>
                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 px-3 py-2 rounded-md mb-6 border border-green-100">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Applications Open
                                </div>
                                <Button className="w-full mb-3 bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">Apply Now</Button>
                                <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50">Download Brochure</Button>
                            </div>

                            <div className="bg-gray-900 text-gray-300 p-5 rounded-xl text-sm">
                                <p className="mb-2 font-medium text-white">Need help applying?</p>
                                <p className="mb-4 text-gray-400">Get free counseling from our experts.</p>
                                <button className="text-white underline hover:no-underline">Chat with us</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function DashboardStatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string, subtext: string }) {
    return (
        <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div className="mb-3 p-2 bg-gray-50 w-fit rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-900 truncate" title={value}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{subtext}</p>
            </div>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="h-[73px] border-b border-gray-200 bg-white"></div>
            <div className="max-w-6xl mx-auto px-6 py-12">
                <Skeleton className="h-40 w-full mb-8 rounded-xl" />
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <div className="flex gap-8">
                    <Skeleton className="flex-1 h-96 rounded-xl" />
                    <Skeleton className="w-80 h-64 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">College not found</h2>
            <p className="text-gray-500 mb-6 max-w-md">The college you are looking for does not exist or has been removed.</p>
            <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
        </div>
    )
}
