"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Compass,
    Bookmark,
    ArrowLeftRight,
    CalendarDays,
    Globe,
    User,
    LogOut,
    Sparkles,
    Code,
    ChevronRight,
    GraduationCap,
    Video
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export function Sidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Indian Colleges', icon: Compass, href: '/indian-colleges' },
        { name: 'International', icon: Globe, href: '/international' },
        { name: 'New-Gen Colleges', icon: Sparkles, href: '/new-gen' },
        { name: 'Saved Colleges', icon: Bookmark, href: '/saved' },
        { name: 'Compare', icon: ArrowLeftRight, href: '/compare' },
        { name: 'Prep', icon: Code, href: '/prep' },
        { name: 'Book Session', icon: Video, href: '/sessions' },
        { name: 'Entrance Exams', icon: GraduationCap, href: '/exams' },
        { name: 'Deadlines', icon: CalendarDays, href: '/exams-deadlines' },
    ];

    if (!user) return null;

    return (
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden">
            {/* Logo */}
            <div className="h-20 px-6 flex items-center border-b border-gray-50/50">
                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/restart.png"
                        alt="REstart Logo"
                        width={150}
                        height={50}
                        priority
                        className="h-10 w-auto object-contain transition-transform hover:scale-105 duration-300"
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-1 ring-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon
                                size={18}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-all duration-300 ${isActive
                                    ? 'text-white scale-110'
                                    : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                            />
                            <span className={`flex-1 transition-all duration-300 ${isActive ? 'translate-x-0.5 font-semibold' : ''}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section: Profile & Logout */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                <div className="mb-2">
                    <Link
                        href="/profile"
                        className={`
                            group flex items-center gap-3 p-2 rounded-xl transition-all duration-200
                            ${pathname === '/profile'
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                                : 'hover:bg-gray-100 text-gray-700'
                            }
                        `}
                    >
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${pathname === '/profile' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 ring-1 ring-gray-200'
                            }`}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-sm truncate">
                                {user.name || 'User'}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-medium">
                                {user.role || 'Student Account'}
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="space-y-0.5">
                    <button
                        onClick={handleLogout}
                        className="w-full group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut size={16} strokeWidth={2} className="text-gray-400 group-hover:text-red-500" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
