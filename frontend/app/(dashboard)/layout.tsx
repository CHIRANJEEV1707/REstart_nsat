"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DashboardProvider } from "@/context/DashboardContext";
import AuthGuard from "@/components/auth/AuthGuard";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <DashboardProvider>
            <AuthGuard>
                <div className="flex min-h-screen bg-gray-50">
                    {/* Desktop Sidebar - Hidden on Exam Pages */}
                    {!pathname?.includes('/prep/nsat/mock-tests/') || pathname?.includes('/results/') ? (
                        <Sidebar />
                    ) : null}

                    {/* Mobile Header - Hidden on Exam Pages */}
                    {(!pathname?.includes('/prep/nsat/mock-tests/') || pathname?.includes('/results/')) && (
                        <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 p-4 flex justify-between items-center shadow-sm">
                            <span className="font-bold text-indigo-600 text-xl">REstart</span>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    )}

                    {/* Mobile Sidebar Overlay */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6">
                            <Sidebar />
                        </div>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto h-screen lg:pt-0 pt-16">
                        {children}
                    </main>
                </div>
            </AuthGuard>
        </DashboardProvider>
    );
}
