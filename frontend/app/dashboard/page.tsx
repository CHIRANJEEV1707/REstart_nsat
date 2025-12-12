"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Components
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AnnouncementBar } from "@/components/dashboard/AnnouncementBar";
import { MatchSummaryCard } from "@/components/dashboard/MatchSummaryCard";
import { RecommendedCollegesCard } from "@/components/dashboard/RecommendedCollegesCard";
import { DeadlinesCard } from "@/components/dashboard/DeadlinesCard";
import { SavedCollegesCard } from "@/components/dashboard/SavedCollegesCard";
import { CompareCard } from "@/components/dashboard/CompareCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickTools } from "@/components/dashboard/QuickTools";
import { GreetingSkeleton } from "@/components/dashboard/GreetingHeader";
import Navbar from "@/components/Navbar"; // Fallback for mobile

export default function DashboardPage() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: dashboard, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        },
        retry: false
    });

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            router.push('/auth/login');
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Skeleton Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 hidden lg:block p-6 space-y-4">
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md mb-8"></div>
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-full"></div>
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-full"></div>
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-full"></div>
            </div>
            {/* Skeleton Feed */}
            <div className="flex-1 p-8 space-y-8">
                <div className="h-48 w-full bg-gray-200 animate-pulse rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl"></div>
                    <div className="h-64 w-full bg-gray-200 animate-pulse rounded-2xl"></div>
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
        <div className="min-h-screen bg-gray-50 flex">

            {/* A) Left Sidebar (Desktop) */}
            <Sidebar user={dashboard.user} logout={logout} />

            {/* Mobile Header (Visible only on mobile) */}
            <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm">
                <span className="font-bold text-indigo-600 text-xl">REstart</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6">
                    <Sidebar user={dashboard.user} logout={logout} />
                </div>
            )}

            {/* B) Main Content Area (Feed) */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto lg:pt-0 pt-16">

                {/* Announcement Bar */}


                <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">

                    {/* 1. College Fit Hero */}
                    <div className="h-[300px]">
                        <MatchSummaryCard data={dashboard.fit_overview} user={dashboard.user} />
                    </div>
                    {/* 2. Recommended Colleges Carousel */}
                    <RecommendedCollegesCard colleges={dashboard.recommendations} />

                    {/* 3. Deadlines & Updates Row */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <DeadlinesCard deadlines={dashboard.deadlines} />
                        <div className="space-y-8">
                            <SavedCollegesCard colleges={dashboard.saved_colleges} count={dashboard.user.saved_count} />
                        </div>
                    </div>

                </div>
            </main>

            {/* C) Right Sidebar (Tools & Utils) */}
            <aside className="w-80 bg-white border-l border-gray-100 hidden xl:flex flex-col h-screen overflow-y-auto sticky top-0 p-6 space-y-8">

                {/* Profile Widget */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {dashboard.user.name[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{dashboard.user.name}</h4>
                        <p className="text-xs text-gray-500">{dashboard.user.email}</p>
                    </div>
                </div>

                {/* Calendar */}
                <MiniCalendar />

                {/* Quick Tools */}
                <QuickTools />

                {/* Promo/Ad Space Placeholder */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center">
                    <h4 className="font-bold mb-2">Pro Prep Plan</h4>
                    <p className="text-xs text-pink-100 mb-4 opacity-90">Unlock personalized study roadmaps generated by AI.</p>
                    <button className="bg-white text-pink-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>

                <div className="mt-auto text-xs text-center text-gray-400">
                    © 2025 REstart. All rights reserved.
                </div>
            </aside>

        </div>
    );
}
