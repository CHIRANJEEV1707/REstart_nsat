"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const res = await api.get('/user/profile');
            const user = res.data.data;

            if (user.onboardingCompleted) {
                router.replace('/dashboard');
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // If checking fails (e.g. 401), middleware should catch it, 
            // but just in case, redirect to login or stay here if it's a network error.
            // For now, let's assume if we can't get profile, we might not be logged in or other issue.
            // Let's stop loading so we don't block.
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <OnboardingWizard />
        </div>
    );
}
