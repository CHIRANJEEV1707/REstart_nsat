"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { GreetingHeader, GreetingSkeleton } from "@/components/dashboard/GreetingHeader";
import { FitOverviewCard } from "@/components/dashboard/FitOverviewCard";
import { SavedCollegesCard } from "@/components/dashboard/SavedCollegesCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { RecommendedCollegesCard } from "@/components/dashboard/RecommendedCollegesCard";
import { CompareCard } from "@/components/dashboard/CompareCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { QuickTools } from "@/components/dashboard/QuickTools";
import Link from "next/link";

export default function DashboardPage() {
    const { data: dashboard, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        },
        retry: false
    });

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <GreetingSkeleton />
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
                    <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
                    <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
                </div>
            </div>
        </div>
    );

    if (isError || !dashboard) return (
        <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 px-4">
            <p className="mb-4 text-gray-600 text-lg">Unable to load dashboard. Please login again.</p>
            <Link href="/auth/login" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Go to Login</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

                {/* 1. Greeting */}
                <GreetingHeader name={dashboard.user.name} />

                <div className="flex flex-col gap-8">

                    {/* Row 1: Overview, Saved, Deadlines */}
                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Fit Overview - 3 cols */}
                        <div className="md:col-span-3">
                            <FitOverviewCard data={dashboard.fit_overview} />
                        </div>

                        {/* Saved Colleges - 5 cols */}
                        <div className="md:col-span-5">
                            <SavedCollegesCard colleges={dashboard.saved_colleges} count={dashboard.user.saved_count} />
                        </div>

                        {/* Deadlines - 4 cols */}
                        <div className="md:col-span-4">
                            <DeadlinesCard deadlines={dashboard.deadlines} />
                        </div>
                    </div>

                    {/* Quick Tools Row (Inserted for mobile/desktop flow) */}
                    <QuickTools />

                    {/* Row 2: Recommended vs Compare */}
                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Recommended - 8 cols */}
                        <div className="md:col-span-8">
                            <RecommendedCollegesCard colleges={dashboard.recommendations} />
                        </div>

                        {/* Compare - 4 cols */}
                        <div className="md:col-span-4">
                            <CompareCard />
                        </div>
                    </div>

                    {/* Row 3: Alerts Full Width */}
                    <div>
                        <AlertsCard alerts={dashboard.alerts} />
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
