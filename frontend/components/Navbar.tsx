'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, isLoading } = useAuth();

    return (
        <nav
            className="absolute top-0 left-0 right-0 z-50 bg-transparent"
            style={{ padding: '20px 32px' }}
        >
            <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://letsrestart.in"
                        className="hidden sm:inline-flex items-center text-sm font-bold transition-all px-6 py-2.5 whitespace-nowrap rounded-full bg-[#0085ff] text-[#ffffff]"
                        style={{
                            boxShadow: '0 0 12px rgba(0, 133, 255, 0.35), 0 4px 16px rgba(0, 133, 255, 0.2)',
                            border: '1px solid rgba(0, 133, 255, 0.6)'
                        }}
                    >
                        ← letsrestart.in
                    </a>
                    
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <NextImage
                            src="/images/REstart_dark.svg"
                            alt="REstart"
                            width={260}
                            height={80}
                            className="h-16 md:h-20 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Right */}
                <div className="flex items-center">
                    {isLoading ? (
                        <div className="w-28 h-8 bg-black/10 animate-pulse rounded-full" />
                    ) : user ? (
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 rounded-full bg-[#0085ff] text-[#ffffff] text-sm font-bold transition-transform hover:scale-[1.03] inline-flex items-center justify-center"
                            style={{
                                boxShadow: '0 0 20px rgba(0, 133, 255, 0.5), 0 4px 20px rgba(0, 133, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            Dashboard →
                        </Link>
                    ) : (
                        <Link
                            href="/auth/signup"
                            className="px-6 py-2.5 rounded-full bg-[#0085ff] text-[#ffffff] text-sm font-bold transition-transform hover:scale-[1.03] inline-flex items-center justify-center"
                            style={{
                                boxShadow: '0 0 20px rgba(0, 133, 255, 0.5), 0 4px 20px rgba(0, 133, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            Start Free
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
