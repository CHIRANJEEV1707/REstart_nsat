"use client";

import { useComparison } from "@/context/ComparisonContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { X } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export function CompareView() {
    const { selectedColleges, removeFromCompare } = useComparison();
    const { setActiveView } = useDashboard();

    const { data: colleges = [], isLoading } = useQuery({
        queryKey: ['compare-colleges', selectedColleges],
        queryFn: async () => {
            if (selectedColleges.length === 0) return [];
            const res = await api.post('/compare', { colleges: selectedColleges });
            return res.data.data;
        },
        enabled: selectedColleges.length > 0
    });

    if (selectedColleges.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[60vh] fade-in slide-in-from-bottom-2 duration-500 animate-in">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl">⚖️</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
                <p className="text-gray-500 max-w-md mb-8">Add up to 3 colleges to see a side-by-side comparison of fees, exams, and more.</p>
                <Button size="lg" onClick={() => setActiveView("discover")}>
                    Browse Colleges
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
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
                    <Button variant="outline" onClick={() => setActiveView("discover")}>
                        + Add More
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 w-48 bg-gray-50/50 border-b border-gray-100 rounded-tl-xl">Features</th>
                            {colleges.map((col: any, idx: number) => (
                                <th key={col._id || idx} className="p-4 min-w-[280px] border-b border-gray-100 align-top relative group last:rounded-tr-xl">
                                    <button
                                        onClick={() => removeFromCompare(col._id)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="mb-3">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
                                            {col.ranking || 'N/A'}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                            <Link href={`/${col.type === 'international' ? 'international' : 'college'}/${col._id}`} className="hover:underline">
                                                {col.name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-500">{col.location}</p>
                                    </div>
                                    <Button size="sm" className="w-full" asChild>
                                        <Link href={`/${col.type === 'international' ? 'international' : 'college'}/${col._id}`}>View Details</Link>
                                    </Button>
                                </th>
                            ))}
                            {/* Fill empty slots if less than 3 */}
                            {[...Array(Math.max(0, 3 - selectedColleges.length))].map((_, i) => (
                                <th key={i} className={`p-4 min-w-[280px] border-b border-gray-100 bg-gray-50/30 align-middle text-center ${i === Math.max(0, 3 - selectedColleges.length) - 1 ? 'rounded-tr-xl' : ''}`}>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center h-48">
                                        <p className="text-sm text-gray-400 font-medium mb-3">Add another college</p>
                                        <Button variant="outline" size="sm" onClick={() => setActiveView("discover")}>
                                            Browse
                                        </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading comparison details...</td></tr>
                        ) : (
                            <>
                                <Row label="Institute Type" data={colleges} render={(c) => <span className="capitalize">{c.institute_type}</span>} />
                                <Row label="Annual Fees" data={colleges} render={(c) => c.fees} />
                                <Row label="Exams Required" data={colleges} render={(c) => (
                                    <div className="text-sm text-gray-700">{c.exams || 'None'}</div>
                                )} />
                                <Row label="Highlights" data={colleges} render={(c) => (
                                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                                        {c.highlights?.map((b: string) => <li key={b}>{b}</li>)}
                                    </ul>
                                )} />
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
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
            {[...Array(Math.max(0, 3 - data.length))].map((_, i) => <td key={i} className="p-4"></td>)}
        </tr>
    );
}
