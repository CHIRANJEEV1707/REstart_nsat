"use client";

import { useDashboard } from "@/context/DashboardContext";
import { MatchSummaryCard } from "@/components/dashboard/MatchSummaryCard";
import { RecommendedCollegesCard } from "@/components/dashboard/RecommendedCollegesCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { SavedCollegesCard } from "@/components/dashboard/SavedCollegesCard";
import CollegeCard from "@/components/colleges/CollegeCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Sparkles, Globe, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/ui/AuthButton";

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { openCollegeDetails } = useDashboard(); // This now pushes to router

    // Check Auth - although AuthGuard handles this, keeping it robust for data fetching
    const { data: dashboard, isLoading: isDashboardLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        },
        enabled: !!user,
        retry: false
    });

    if (isDashboardLoading || !user) {
        return (
            <div className="p-6 md:p-8 space-y-8">
                <div className="h-48 w-full bg-gray-100 animate-pulse rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl"></div>
                    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center flex-col min-h-[50vh] px-4">
                <p className="mb-4 text-gray-600 text-lg">Unable to load dashboard. Please login again.</p>
                <AuthButton />
            </div>
        );
    }

    // Preference Checks
    const showNewGen = user.preferences?.newGenInterest || user.preferences?.aspiringCollegeType?.includes("New-Gen") || dashboard.user.preferences?.newGenInterest;
    const showInternational = user.preferences?.preferredCountries?.some((c: string) => c !== 'India') || dashboard.user.preferences?.preferredCountries?.some((c: string) => c !== 'India');

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            {/* 1. College Fit Hero */}
            <div className="h-[300px]">
                <MatchSummaryCard />
            </div>

            {/* 2. Recommended Colleges Carousel */}
            <RecommendedCollegesCard />

            {/* 🆕 New-Gen Colleges Section - Conditionally Rendered */}
            {showNewGen && <NewGenSection openCollegeDetails={openCollegeDetails} />}

            {/* 🌍 International Colleges Section - Conditionally Rendered */}
            {showInternational && <InternationalSection openCollegeDetails={openCollegeDetails} user={user} />}

            {/* 3. Deadlines & Updates Row */}
            <div className="grid md:grid-cols-2 gap-8">
                <DeadlinesCard deadlines={dashboard.deadlines} />
                <div className="space-y-8">
                    <div className="relative group cursor-pointer" onClick={() => router.push('/saved')}>
                        <SavedCollegesCard colleges={dashboard.saved_colleges} count={user.saved_count || dashboard.saved_colleges.length} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function NewGenSection({ openCollegeDetails }: { openCollegeDetails: (id: string) => void }) {
    const { data: newGenColleges } = useQuery({
        queryKey: ['newgen-colleges-dashboard'],
        queryFn: async () => {
            const res = await api.get('/colleges/new-gen?limit=3');
            return res.data.data;
        }
    });

    if (!newGenColleges?.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600 w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">New-Gen Tech Schools</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {newGenColleges.slice(0, 3).map((col: any) => (
                    <div key={col._id} className="h-full">
                        <CollegeCard
                            college={col}
                            variant="newgen"
                            onClick={() => openCollegeDetails(col._id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function InternationalSection({ openCollegeDetails, user }: { openCollegeDetails: (id: string) => void, user: any }) {
    const { data: internationalColleges } = useQuery({
        queryKey: ['international-colleges-dashboard'],
        queryFn: async () => {
            const countries = user.preferences?.preferredCountries?.filter((c: string) => c !== 'India').join(',');
            const res = await api.get(`/colleges/international?country=${countries}&limit=3`);
            return res.data.data;
        }
    });

    if (!internationalColleges?.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Globe className="text-blue-600 w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">Global Opportunities</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {internationalColleges.slice(0, 3).map((col: any) => (
                    <div key={col._id} className="h-full">
                        <CollegeCard
                            college={col}
                            variant="international"
                            onClick={() => openCollegeDetails(col._id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
