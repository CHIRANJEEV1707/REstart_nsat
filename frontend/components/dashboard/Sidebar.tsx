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
    GraduationCap,
    Sparkles
} from "lucide-react";
import Image from "next/image";
import { useDashboard, DashboardView } from "@/context/DashboardContext";

interface SidebarProps {
    user: {
        name: string;
        state?: string;
        target_degree?: string;
    };
    logout: () => void;
}

export function Sidebar({ user, logout }: SidebarProps) {
    const { activeView, setActiveView } = useDashboard();

    const navItems: { name: string; icon: any; view: DashboardView }[] = [
        { name: 'Dashboard', icon: LayoutDashboard, view: 'overview' },
        { name: 'Discover Colleges', icon: Compass, view: 'discover-indian' },
        { name: 'International', icon: Globe, view: 'discover-international' },
        { name: 'New-Gen Colleges', icon: Sparkles, view: 'discover-newgen' },
        { name: 'Saved Colleges', icon: Bookmark, view: 'saved' },
        { name: 'Compare Colleges', icon: ArrowLeftRight, view: 'compare' },
        { name: 'Exams & Deadlines', icon: CalendarDays, view: 'deadlines' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
                <button onClick={() => setActiveView('overview')} className="flex items-center gap-2">
                    <Image
                        src="/Restart_logo.png"
                        alt="REstart Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                </button>
            </div>

            {/* User Greeting */}
            <div className="px-6 mb-6">
                <div className="p-4 bg-indigo-50 rounded-xl">
                    <div className="font-semibold text-gray-900 border-b border-indigo-100 pb-2 mb-2">
                        Hello, {user.name.split(' ')[0]} 👋
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
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setActiveView(item.view)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${activeView === item.view
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                            }`}
                    >
                        <item.icon
                            size={18}
                            className={`transition-colors ${activeView === item.view
                                ? 'text-indigo-600'
                                : 'text-gray-400 group-hover:text-indigo-600'
                                }`}
                        />
                        {item.name}
                    </button>
                ))}
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-gray-100 space-y-1">
                <button
                    onClick={() => setActiveView('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${activeView === 'profile'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        }`}
                >
                    <User
                        size={18}
                        className={`transition-colors ${activeView === 'profile'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-indigo-600'
                            }`}
                    />
                    Profile Settings
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

