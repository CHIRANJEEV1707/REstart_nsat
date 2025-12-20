"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Card } from '@/components/ui/Card';

import { Suspense } from 'react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        if (!token) {
            setStatus("Invalid link");
            return;
        }

        api.post('/auth/verify', { token })
            .then(() => {
                setStatus("Success! Redirecting...");
                setTimeout(() => router.push('/dashboard'), 1000);
            })
            .catch(() => {
                setStatus("Verification failed. Link might be expired.");
            });
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="p-8 text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900">{status}</h2>
            </Card>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
