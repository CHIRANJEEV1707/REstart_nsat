"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import Link from "next/link";
import { useComparison } from "@/context/ComparisonContext";

export default function InternationalCollegeDetailPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const { addToCompare, removeFromCompare, isInCompare } = useComparison();

    const isCompared = isInCompare(id as string);
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['international-college', id],
        queryFn: async () => {
            const res = await api.get(`/international-colleges/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const college = response?.data;

    const handleCompare = () => {
        if (isCompared) {
            removeFromCompare(id as string);
        } else {
            addToCompare({ _id: id as string, name: college?.name || 'College', type: 'international' });
        }
    };

    if (isLoading) return <LoadingState />;
    if (isError || !college) return <ErrorState />;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-blue-900 text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex gap-3 mb-4">
                                <Badge className="bg-white/10 text-white hover:bg-white/20 border-none">#{college.global_ranking} Global Rank</Badge>
                                {college.badges?.map((b: string) => (
                                    <Badge key={b} className="bg-white/10 text-white hover:bg-white/20 border-none">{b}</Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2">{college.name}</h1>
                            <p className="text-gray-400 text-lg">{college.city}, {college.country}</p>
                        </div>
                        <div className="flex gap-4">
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
                            {['overview', 'tuition & visa', 'exams'].map((tab) => (
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">About the University</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        An elite {college.university_type} institution located in {college.city}, {college.country}. Known for its high academic standards and global recognition.
                                    </p>
                                </section>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <StatCard label="Global Ranking" value={`#${college.global_ranking} (${college.ranking_body})`} />
                                    <StatCard label="University Type" value={college.university_type} />
                                    <StatCard label="Tuition (Annual)" value={`$${college.tuition_fee_annual?.toLocaleString()}`} />
                                    <StatCard label="Living Cost (Annual)" value={`$${college.living_cost_annual?.toLocaleString()}`} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tuition & visa' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Tuition & Visa Info</h3>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Annual Tuition</span>
                                        <span className="text-2xl font-bold text-gray-900">${college.tuition_fee_annual?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Living Expenses</span>
                                        <span className="text-xl font-bold text-gray-700">${college.living_cost_annual?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900">Visa Requirements</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                                        {college.study_abroad_info?.visa_requirements.map((req: string, i: number) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="font-bold text-gray-900">Post-Study Work</h4>
                                    <p className="text-gray-600">{college.study_abroad_info?.post_study_work_permit}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'exams' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Admission Requirements</h3>

                                <div className="grid gap-6">
                                    <div className="p-4 border border-gray-200 rounded-xl">
                                        <h4 className="font-bold text-gray-900 mb-3">Entrance Exams</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {college.entrance_exams?.map((ex: string) => (
                                                <Badge key={ex} variant="secondary">{ex}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-xl">
                                        <h4 className="font-bold text-gray-900 mb-3">English Proficiency</h4>
                                        <div className="flex flex-col gap-2">
                                            {college.english_tests?.map((test: string) => (
                                                <div key={test} className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-700">{test}</span>
                                                    <span className="text-gray-500">Min Score: {college.minimum_scores?.[test.toLowerCase()] || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 space-y-6">
                        <div className="p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Application Deadlines</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fall Intake</span>
                                    <span className="font-bold text-gray-900">{college.admission_deadlines?.fall}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Spring Intake</span>
                                    <span className="font-bold text-gray-900">{college.admission_deadlines?.spring}</span>
                                </div>
                            </div>
                            <Button className="w-full mb-3" size="lg" asChild>
                                <a href={college.official_website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                            </Button>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">University not found</h2>
                <Button asChild><Link href="/international">Back to International</Link></Button>
            </div>
            <Footer />
        </div>
    )
}
