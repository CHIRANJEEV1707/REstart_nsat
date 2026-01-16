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
    Users,
    LogOut,
    Sparkles,
    ScrollText,
    Code
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
        { name: 'NSAT Prep', icon: ScrollText, href: '/nsat-prep' },
        { name: 'NSAT Coding', icon: Code, href: '/nsat-coding' },
        { name: 'REstart Sessions', icon: Users, href: '/sessions', badge: 'NEW' },
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
                            <span
                                className="font-medium text-gray-700 truncate max-w-[150px] text-right"
                                title={Array.isArray(user.target_degree) ? user.target_degree.join(', ') : user.target_degree}
                            >
                                {Array.isArray(user.target_degree)
                                    ? user.target_degree.join(', ')
                                    : (user.target_degree || 'Not Set')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all group ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <item.icon
                                size={18}
                                className={`transition-colors ${isActive
                                    ? 'text-blue-600'
                                    : 'text-gray-400 group-hover:text-blue-600'
                                    }`}
                            />
                            <span className="flex-1">{item.name}</span>
                            {(item as any).badge && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full">
                                    {(item as any).badge}
                                </span>
                            )}
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

