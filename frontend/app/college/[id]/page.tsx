"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import Link from "next/link";
import { useComparison } from "@/context/ComparisonContext";

export default function CollegeDetailPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const { addToCompare, removeFromCompare, isInCompare } = useComparison();

    const isCompared = isInCompare(id as string);

    const handleCompare = () => {
        if (isCompared) {
            removeFromCompare(id as string);
        } else {
            addToCompare({ _id: id as string, name: college?.name || 'College', type: 'indian' });
        }
    };

    // Fetch user to check saved status
    const { data: userRes } = useQuery({
        queryKey: ['me'],
        queryFn: async () => (await api.get('/auth/me').catch(() => null))?.data
    });
    const user = userRes?.data;
    // Handle both populated (objects) and unpopulated (strings) saved_colleges
    const isSaved = user?.saved_colleges?.some((c: any) => (typeof c === 'string' ? c : c._id) === id);

    const queryClient = useQueryClient();
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (isSaved) await api.delete(`/saved/${id}`);
            else await api.post('/saved', { collegeId: id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['saved'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });

    const handleSave = () => {
        if (!user) return window.location.href = '/auth/login';
        saveMutation.mutate();
    };

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['college', id],
        queryFn: async () => {
            const res = await api.get(`/colleges/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const college = response?.data;

    if (isLoading) return <LoadingState />;
    if (isError || !college) return <ErrorState />;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-gray-900 text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex gap-3 mb-4">
                                {college.badges?.map((b: string) => (
                                    <Badge key={b} className="bg-white/10 text-white hover:bg-white/20 border-none">{b}</Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2">{college.name}</h1>
                            <p className="text-gray-400 text-lg">{college.location?.city}, {college.location?.state}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={handleSave}
                                className={`min-w-[140px] ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
                            >
                                {isSaved ? 'Saved ✓' : 'Save College'}
                            </Button>
                            <Button
                                variant="outline"
                                className={`border-gray-700 text-white hover:bg-gray-800 hover:text-white ${isCompared ? 'bg-indigo-900 ring-2 ring-indigo-500' : ''}`}
                                onClick={handleCompare}
                            >
                                {isCompared ? '✓ Added to Compare' : '+ Compare'}
                            </Button>
                            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 hover:text-white">Share</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
                            {['overview', 'fees', 'exams', 'admission'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">About the Institute</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {college.description || "No description available for this college."}
                                    </p>
                                </section>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <StatCard label="Restart Score" value={`${college.restart_score}/10`} />
                                    <StatCard label="Institute Type" value={college.type} />
                                    <StatCard label="Avg. Package" value={college.placement_stats?.average_package || 'N/A'} />
                                    <StatCard label="Highest Package" value={college.placement_stats?.highest_package || 'N/A'} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'fees' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Fee Structure</h3>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Annual Tuition Fee</span>
                                        <span className="text-2xl font-bold text-gray-900">₹{(college.fees).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        * Fees are approximate and subject to change. Scholarships available for meritorious students.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'exams' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Exams Accepted</h3>
                                <div className="grid gap-4">
                                    {college.exams_required?.map((ex: string) => (
                                        <div key={ex} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all">
                                            <span className="font-bold text-gray-800">{ex}</span>
                                            <Link href="/exams" className="text-sm text-indigo-600 font-medium hover:underline">View Exam Details</Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'admission' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">How to Get In</h3>
                                <div className="flex flex-col gap-6">
                                    {college.admission_process?.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-6">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{step}</h4>
                                                <p className="text-sm text-gray-500">Complete this step to move forward.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 space-y-6">
                        <div className="p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Application Status</h3>
                            <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 p-3 rounded-lg mb-6">
                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                Applications Open
                            </div>
                            <Button className="w-full mb-3" size="lg">Apply Now</Button>
                            <Button variant="outline" className="w-full">Download Brochure</Button>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function StatCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="h-64 bg-gray-100 animate-pulse"></div>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Skeleton className="h-10 w-1/3 mb-8" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}

function ErrorState() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">College not found</h2>
                <p className="text-gray-500 mb-6">The college you are looking for does not exist.</p>
                <Button asChild><Link href="/discover">Back to Discovery</Link></Button>
            </div>
            <Footer />
        </div>
    )
}
