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
    ChevronRight
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
        { name: 'NSAT Prep', icon: Code, href: '/nsat-prep' },
        { name: 'Deadlines', icon: CalendarDays, href: '/exams-deadlines' },
    ];

    if (!user) return null;

    return (
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 pb-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src="/Restart_logo.png"
                        alt="REstart Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* User Greeting Card */}
            <div className="px-5 mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 text-sm">
                                {user.name?.split(' ')[0] || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">Premium</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                            <span className="text-gray-500">State</span>
                            <div className="font-medium text-gray-900 truncate">{user.state || 'Not Set'}</div>
                        </div>
                        <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
                            <span className="text-gray-500">Goal</span>
                            <div className="font-medium text-gray-900 truncate">
                                {Array.isArray(user.target_degree)
                                    ? user.target_degree[0]
                                    : (user.target_degree || 'Not Set')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={isActive ? 2 : 1.5}
                                className={`transition-colors ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                            />
                            <span className="flex-1">{item.name}</span>
                            {isActive && (
                                <ChevronRight size={16} className="text-indigo-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-gray-100 space-y-1">
                <Link
                    href="/profile"
                    className={`
                        group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${pathname === '/profile'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                    `}
                >
                    <User
                        size={20}
                        strokeWidth={pathname === '/profile' ? 2 : 1.5}
                        className={`transition-colors ${pathname === '/profile'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                    />
                    Profile Settings
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut size={20} strokeWidth={1.5} className="text-red-400 group-hover:text-red-500" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
