"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Context
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

// Components
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickTools } from "@/components/dashboard/QuickTools";
import CompareTray from "@/components/dashboard/CompareTray";
import AuthButton from "@/components/ui/AuthButton";

// Views
import { OverviewView } from "@/components/dashboard/views/OverviewView";
import { DiscoverIndianView } from "@/components/dashboard/views/DiscoverIndianView"; // Renamed/New
import { NewGenView } from "@/components/dashboard/views/NewGenView"; // New
import { SavedCollegesView } from "@/components/dashboard/views/SavedCollegesView";
import CompareView from "@/components/dashboard/views/CompareView";
import { DeadlinesView } from "@/components/dashboard/views/DeadlinesView";
import { InternationalView } from "@/components/dashboard/views/InternationalView";
import { ProfileView } from "@/components/dashboard/views/ProfileView";
import { CollegeDetailsView } from "@/components/dashboard/views/CollegeDetailsView";
import { InternationalCountryView } from "@/components/dashboard/views/InternationalCountryView";
import { ExamDetailsView } from "@/components/dashboard/views/ExamDetailsView";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardPage() {
    return (
        <DashboardProvider>
            <ErrorBoundary>
                <DashboardContent />
            </ErrorBoundary>
        </DashboardProvider>
    );
}

function DashboardContent() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { activeView } = useDashboard();
    const mainContentRef = React.useRef<HTMLElement>(null);

    // Scroll to top when view changes, except when going back to discover
    React.useEffect(() => {
        if (mainContentRef.current && activeView !== 'discover-indian' && activeView !== 'college-details') {
            mainContentRef.current.scrollTop = 0;
        }
    }, [activeView]);


    // Step 1: Check authentication status FIRST
    const { data: authUser, isLoading: isCheckingAuth, isError: authError } = useQuery({
        queryKey: ['auth-check'],
        queryFn: async () => {
            const res = await api.get('/auth/me');
            return res.data.data;
        },
        retry: false, // Don't retry on 401
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Step 2: Only fetch dashboard data if authenticated
    const { data: dashboard, isLoading: isDashboardLoading, isError: isDashboardError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        },
        retry: false, // Don't retry on 401
        enabled: !!authUser, // Only run if user is authenticated
    });

    // Redirect to login if auth check fails
    React.useEffect(() => {
        if (authError) {
            console.log('[Dashboard] Auth check failed, redirecting to login');
            router.replace('/auth/login');
        }
    }, [authError, router]);

    // Redirect to onboarding if user hasn't completed it
    React.useEffect(() => {
        if (authUser && !authUser.onboardingCompleted) {
            router.replace('/onboarding');
        }
    }, [authUser, router]);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            router.push('/auth/login');
        } catch (err) {
            console.error(err);
            toast.error('Failed to logout. Please try again.');
        }
    };

    // Show loading while checking auth or loading dashboard
    const isLoading = isCheckingAuth || isDashboardLoading;

    // Show error if dashboard fetch fails (auth error is handled by redirect)
    const isError = isDashboardError;

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
            <AuthButton />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* A) Left Sidebar (Desktop) */}
            <Sidebar user={authUser} logout={logout} />

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
                    <Sidebar user={authUser} logout={logout} />
                </div>
            )}

            {/* B) Main Content Area (Feed) */}
            <main ref={mainContentRef} className="flex-1 flex flex-col h-screen overflow-y-auto lg:pt-0 pt-16">

                {/* View Switcher */}
                {/* View Switcher */}
                {activeView === 'overview' && <OverviewView dashboard={dashboard} />}

                {/* 
                    Keep views mounted but hidden if needed for state preservation, 
                    OR just render conditionally. 
                    Given the requirement: "Switching tabs preserves scroll & filters", 
                    we should try to keep them mounted or rely on Context/React Query cache.
                    React Query cache is usually enough for data. 
                    Scroll preservation might require hidden divs.
                    For now, following the pattern of 'discover' being hidden/shown.
                */}

                <div style={{ display: activeView === 'discover-indian' ? 'block' : 'none' }}>
                    <DiscoverIndianView />
                </div>

                <div style={{ display: activeView === 'discover-international' ? 'block' : 'none' }}>
                    <InternationalView />
                </div>

                <div style={{ display: activeView === 'discover-newgen' ? 'block' : 'none' }}>
                    <NewGenView />
                </div>

                {activeView === 'college-details' && <CollegeDetailsView />}
                {activeView === 'international-country' && <InternationalCountryView />}
                {activeView === 'exam-details' && <ExamDetailsView />}
                {activeView === 'saved' && <SavedCollegesView />}
                {activeView === 'compare' && <CompareView />}
                {activeView === 'deadlines' && <DeadlinesView />}
                {/* Legacy view support if any */}
                {activeView === 'international' && <InternationalView />}
                {activeView === 'profile' && <ProfileView />}

            </main>

            {/* Compare Tray (Global) */}
            <CompareTray />

        </div>
    );
}
