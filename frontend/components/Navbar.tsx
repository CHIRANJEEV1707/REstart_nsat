'use client';

import Link from 'next/link';
import NextImage from 'next/image';


import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function Navbar() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const res = await api.get('/auth/me');
                return res.data.data;
            } catch (err) {
                return null;
            }
        },
        retry: false,
    });

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <NextImage
                        src="/Restart_logo.png"
                        alt="REstart Logo"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <Link href="/discover" className="hover:text-indigo-600 transition-colors">Colleges</Link>
                    <Link href="/exams" className="hover:text-indigo-600 transition-colors">Exams</Link>

                    <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                </div>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                    ) : user ? (
                        <Link href="/dashboard" className="hidden md:block px-6 py-2.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/auth/login" className="hidden md:block px-6 py-2.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
