"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { StepPersonalDetails } from '@/components/onboarding/StepPersonalDetails'; // We need to create this

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    // 0: loading, 1: signup done (show step 2), 2: personal done (show step 3 wizard), 3: complete

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const res = await api.get('/user/profile');
            const user = res.data.data;

            // If incomplete logic:
            // If onboardingCompleted -> Dashboard
            if (user.onboardingCompleted) {
                router.replace('/dashboard');
                return;
            }

            // If not completed, check step
            // Default to 1 (Just signed up) if not present
            const currentStep = user.onboardingStep || 1;
            setStep(currentStep);
            setLoading(false);

        } catch (error) {
            console.error("Failed to fetch profile", error);
            setLoading(false);
            // Optional: redirect to login if 401
        }
    };

    const handlePersonalDetailsComplete = () => {
        setStep(2); // Move to next major phase
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
            {step === 1 && (
                <StepPersonalDetails onComplete={handlePersonalDetailsComplete} />
            )}

            {(step === 2 || step === 0) && ( // Fallback to wizard if unknown or step 2
                <OnboardingWizard />
            )}
        </div>
    );
}
