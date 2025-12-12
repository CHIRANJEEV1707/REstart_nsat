"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useComparison } from "@/context/ComparisonContext";
import { useQueries } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { X, Check, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ComparePage() {
    const { selectedColleges, removeFromCompare } = useComparison();

    const collegeQueries = useQueries({
        queries: selectedColleges.map((col) => ({
            queryKey: ['college', col._id],
            queryFn: async () => {
                const res = await api.get(`/colleges/${col._id}`);
                return res.data.data;
            }
        }))
    });

    const isLoading = collegeQueries.some(q => q.isLoading);
    const colleges = collegeQueries.map(q => q.data).filter(Boolean);

    if (selectedColleges.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <span className="text-2xl">⚖️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
                    <p className="text-gray-500 max-w-md mb-8">Add up to 3 colleges to see a side-by-side comparison of fees, exams, and more.</p>
                    <Button size="lg" asChild>
                        <Link href="/discover">Browse Colleges</Link>
                    </Button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
                        <p className="text-gray-500">Comparing {selectedColleges.length} colleges</p>
                    </div>
                    {selectedColleges.length >= 3 ? (
                        <Button variant="outline" disabled>
                            + Add More
                        </Button>
                    ) : (
                        <Button variant="outline" asChild>
                            <Link href="/discover">+ Add More</Link>
                        </Button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 w-48 bg-gray-50/50 border-b border-gray-100">Features</th>
                                {colleges.map((col, idx) => (
                                    <th key={col._id || idx} className="p-4 min-w-[280px] border-b border-gray-100 align-top relative group">
                                        <button
                                            onClick={() => removeFromCompare(col._id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="mb-3">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
                                                ★ {col.restart_score}/10
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                                <Link href={`/college/${col._id}`} className="hover:underline">{col.name}</Link>
                                            </h3>
                                            <p className="text-sm text-gray-500">{col.location?.city || 'Unknown'}, {col.location?.state || 'Unknown'}</p>
                                        </div>
                                        <Button size="sm" className="w-full" asChild>
                                            <Link href={`/college/${col._id}`}>View Details</Link>
                                        </Button>
                                    </th>
                                ))}
                                {/* Fill empty slots if less than 3 */}
                                {[...Array(3 - colleges.length)].map((_, i) => (
                                    <th key={i} className="p-4 min-w-[280px] border-b border-gray-100 bg-gray-50/30 rounded-t-xl align-middle text-center">
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center h-48">
                                            <p className="text-sm text-gray-400 font-medium mb-3">Add another college</p>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/discover">Browse</Link>
                                            </Button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <Row label="Institute Type" data={colleges} render={(c) => c.type} />
                            <Row label="Annual Fees" data={colleges} render={(c) => c.fees ? `₹${c.fees.toLocaleString()}` : 'N/A'} />
                            <Row label="Exams Accepted" data={colleges} render={(c) => (
                                <div className="flex flex-wrap gap-1">
                                    {c.exams_required.map((e: string) => (
                                        <span key={e} className="text-xs bg-gray-100 px-2 py-1 rounded">{e}</span>
                                    ))}
                                </div>
                            )} />
                            <Row label="Avg Package" data={colleges} render={(c) => c.placement_stats?.average_package || '-'} />
                            <Row label="Highest Package" data={colleges} render={(c) => c.placement_stats?.highest_package || '-'} />
                            <Row label="Highlights" data={colleges} render={(c) => (
                                <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                                    {c.badges.slice(0, 3).map((b: string) => <li key={b}>{b}</li>)}
                                </ul>
                            )} />
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function Row({ label, data, render }: { label: string, data: any[], render: (c: any) => React.ReactNode }) {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="p-4 font-medium text-gray-500 border-r border-gray-50">{label}</td>
            {data.map((col, idx) => (
                <td key={col._id || idx} className="p-4 text-gray-900 border-r border-gray-50 last:border-0 align-top">
                    {render(col)}
                </td>
            ))}
            {[...Array(3 - data.length)].map((_, i) => <td key={i} className="p-4"></td>)}
        </tr>
    );
}
