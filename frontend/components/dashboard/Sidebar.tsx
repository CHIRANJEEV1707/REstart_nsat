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
    Sparkles
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
        { name: 'Compare Colleges', icon: ArrowLeftRight, href: '/compare' },
        { name: 'Exams & Deadlines', icon: CalendarDays, href: '/exams-deadlines' },
    ];

    if (!user) return null;

    return (
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
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

            {/* User Greeting */}
            <div className="px-6 mb-6">
                <div className="p-4 bg-indigo-50 rounded-xl">
                    <div className="font-semibold text-gray-900 border-b border-indigo-100 pb-2 mb-2">
                        Hello, {user.name?.split(' ')[0] || 'User'} 👋
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>State:</span>
                            <span className="font-medium text-gray-700">{user.state || 'Not Set'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Goal:</span>
                            <span className="font-medium text-gray-700">{user.target_degree || 'B.Tech'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                        >
                            <item.icon
                                size={18}
                                className={`transition-colors ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-gray-400 group-hover:text-indigo-600'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-gray-100 space-y-1">
                <Link
                    href="/profile"
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${pathname === '/profile'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        }`}
                >
                    <User
                        size={18}
                        className={`transition-colors ${pathname === '/profile'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-indigo-600'
                            }`}
                    />
                    Profile Settings
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

