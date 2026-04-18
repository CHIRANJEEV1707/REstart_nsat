"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Code, Video } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

function PrepProgressCard({ done, total }: { done: number; total: number }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const r = 20;
    const circ = 2 * Math.PI * r;
    const dash = Math.min(done / total, 1) * circ;

    return (
        <div
            className="mx-3 mb-3 rounded-2xl p-4 bg-white"
            style={{ border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,133,255,0.10)' }}
        >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">NSAT Progress</p>

            <div className="flex items-center gap-4">
                {/* Ring */}
                <div className="relative shrink-0">
                    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4"
                            stroke="rgba(0,133,255,0.10)" />
                        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4"
                            stroke="#0085ff"
                            strokeDasharray={`${dash} ${circ}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0085ff] rotate-90">
                        {pct}%
                    </span>
                </div>

                {/* Stats */}
                <div className="min-w-0">
                    <p className="text-xl font-black text-gray-900 leading-none tabular-nums">
                        {done}<span className="text-sm font-semibold text-gray-400">/{total}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">mock tests done</p>
                    <p className="text-[11px] text-[#0085ff] font-semibold mt-1">{total - done} remaining</p>
                </div>
            </div>

            {/* Bar */}
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,133,255,0.10)' }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0085ff, #00aaff)' }}
                />
            </div>
        </div>
    );
}

export function Sidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const { data: dashboardData } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => { const res = await api.get("/dashboard"); return res.data.data; },
        enabled: !!user,
        staleTime: 60 * 1000,
    });

    const { data: mockTestsData } = useQuery({
        queryKey: ["mockTests", "nsat"],
        queryFn: async () => {
            const [a, b] = await Promise.all([
                api.get("/mock-tests?examType=nsat"),
                api.get("/mock-tests?examType=coding-nsat"),
            ]);
            return [...(a.data?.data || []), ...(b.data?.data || [])];
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000,
    });

    const mocksDone: number = dashboardData?.mockScores?.length ?? 0;
    const mocksTotal: number = mockTestsData
        ? (mockTestsData as any[]).filter((t) => t.title?.toLowerCase().includes("mock")).length
        : 0;

    const handleLogout = () => {
        try {
            logout();
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Prep', icon: Code, href: '/prep/nsat' },
        { name: 'Book Session', icon: Video, href: '/sessions' },
    ];

    if (!user) return null;

    return (
        <aside className="w-72 bg-[#f7faff] border-r border-[rgba(0,133,255,0.12)] hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden relative z-20">
            {/* Logo */}
            <div className="h-24 px-6 flex items-center">
                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/restart.png"
                        alt="REstart Logo"
                        width={280}
                        height={100}
                        priority
                        className="h-28 w-auto object-contain transition-transform hover:scale-105 duration-300"
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-2 space-y-1">
                <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-[#0085ff] text-white shadow-lg shadow-[rgba(0,133,255,0.25)]'
                                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                }
                            `}
                        >
                            <item.icon
                                size={18}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
                            />
                            <span className={`flex-1 transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                                {item.name}
                            </span>
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Progress Card */}
            <div className="flex-1 flex flex-col justify-end pb-2 mt-4">
                {mocksTotal > 0 && (
                    <PrepProgressCard done={mocksDone} total={mocksTotal} />
                )}
            </div>

            {/* Bottom: Profile & Logout */}
            <div className="p-3 border-t border-[rgba(0,133,255,0.08)]">
                <Link
                    href="/profile"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mb-1
                        ${pathname === '/profile'
                            ? 'bg-[rgba(0,133,255,0.06)] ring-1 ring-[rgba(0,133,255,0.15)]'
                            : 'hover:bg-white hover:shadow-sm'
                        }
                    `}
                >
                    <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${pathname === '/profile' ? 'bg-[#0085ff] text-white' : 'bg-white text-[#0085ff] ring-1 ring-[rgba(0,133,255,0.2)]'}`}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-sm truncate">{user.name || 'User'}</div>
                        <div className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-medium">{user.role || 'Student'}</div>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                >
                    <LogOut size={15} strokeWidth={2} className="shrink-0 group-hover:text-red-400 transition-colors" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
