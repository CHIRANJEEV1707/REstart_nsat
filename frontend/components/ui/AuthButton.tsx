"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/axios';

interface AuthButtonProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 * Smart authentication button that:
 * - Checks if user is logged in
 * - Redirects to /dashboard if authenticated
 * - Redirects to /auth/login if not authenticated
 * - Uses client-side navigation (no page reload)
 */
export default function AuthButton({
    className = "px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all",
    children = "Go to Login"
}: AuthButtonProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);

    const handleClick = async () => {
        if (isChecking) return; // Prevent double-clicks

        setIsChecking(true);

        try {
            // Check if user is authenticated
            await api.get('/auth/me');

            // User is logged in → go to dashboard
            router.replace('/dashboard');
        } catch (error: any) {
            // User is not logged in (401) → go to login
            if (error.response?.status === 401) {
                router.replace('/auth/login');
            } else {
                // Other errors → still go to login
                router.replace('/auth/login');
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isChecking}
            className={className}
        >
            {isChecking ? 'Checking...' : children}
        </button>
    );
}
