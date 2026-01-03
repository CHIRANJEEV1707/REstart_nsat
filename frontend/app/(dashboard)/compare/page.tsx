
"use client";

import { useEffect } from "react";
import { useCompare } from "@/context/CompareContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { X } from "lucide-react";

export default function ComparePage() {
    const { compareItems, removeFromCompare } = useCompare();

    const { data: colleges = [], isLoading } = useQuery({
        queryKey: ['compare-colleges', compareItems],
        queryFn: async () => {
            if (compareItems.length === 0) return [];
            const res = await api.post('/compare', { colleges: compareItems });
            return res.data.data;
        },
        enabled: compareItems.length > 0
    });

    // Sync check: If we have fewer results than requested, it means some IDs were invalid/deleted.
    useEffect(() => {
        if (!isLoading && compareItems.length > 0 && colleges.length < compareItems.length) {
            // Optional: You could auto-clean here or just warn.
            // For now, let's toast a warning.
            // But we need to be careful not to spam toasts if it re-renders.
            // check if we already toasted or just show a persistent banner? 
            // Better: just rely on the UI showing fewer cols.
        }
    }, [isLoading, colleges.length, compareItems.length]);

    if (compareItems.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-[80vh]">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl">⚖️</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
                <p className="text-gray-500 max-w-md mb-8">Add up to 3 colleges to see a side-by-side comparison of fees, exams, and more.</p>
                <Button size="lg" asChild>
                    <Link href="/dashboard">Browse Colleges</Link>
                </Button>
            </div>
        );
    }

    // Calculate empty slots based on ACTUAL data received, not just requested items.
    // This fixes the UI bug where empty columns wouldn't show if data failed to load.
    const emptySlots = Math.max(0, 3 - colleges.length);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
                    <p className="text-gray-500">Comparing {colleges.length} colleges</p>
                </div>
                {compareItems.length >= 3 ? (
                    <div title="You can only compare up to 3 colleges">
                        <Button variant="outline" disabled>
                            + Add More
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">+ Add More</Link>
                    </Button>
                )}
            </div>

            {colleges.length < compareItems.length && !isLoading && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                    ⚠️ One or more colleges could not be loaded and might have been removed.
                    <button
                        onClick={() => {/* Logic to clear missing could go here, for now manual removal via tray works */ }}
                        className="underline font-semibold ml-1"
                    >
                        Review your list
                    </button>
                </div>
            )}

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 w-48 bg-gray-50/50 border-b border-gray-100">Features</th>
                            {colleges.map((col: any, idx: number) => (
                                <th key={col._id || idx} className="p-4 min-w-[280px] border-b border-gray-100 align-top relative group border-r last:border-r-0">
                                    <button
                                        onClick={() => removeFromCompare(col._id)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="mb-3">
                                        <span className="text-xs font-bold text-[#0085ff] bg-[#0085ff]/10 border border-[#0085ff]/20 px-2 py-1 rounded-full mb-2 inline-block">
                                            Score: {col.restart_score ? col.restart_score.toFixed(1) : 'N/A'}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                            <Link href={`/college/${col._id}`} className="hover:underline">
                                                {col.name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-500">{col.location}</p>
                                    </div>
                                    <Button size="sm" className="w-full" asChild>
                                        <Link href={`/college/${col._id}`}>View Details</Link>
                                    </Button>
                                </th>
                            ))}
                            {/* Fill empty slots based on remaining space */}
                            {[...Array(emptySlots)].map((_, i) => (
                                <th key={`empty-${i}`} className="p-4 min-w-[280px] border-b border-gray-100 bg-gray-50/30 align-middle text-center border-r last:border-r-0">
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center h-48">
                                        <p className="text-sm text-gray-400 font-medium mb-3">Add another college</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/dashboard">Browse</Link>
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
                                <Row label="Institute Type" data={colleges} render={(c) => <span className="capitalize">{c.institute_type || c.type}</span>} />
                                <Row label="Annual Fees" data={colleges} render={(c) => `${c.fees?.toLocaleString() || 'N/A'}`} />
                                <Row label="Exams Required" data={colleges} render={(c) => (
                                    <div className="text-sm text-gray-700">{Array.isArray(c.exams_required) ? c.exams_required.join(', ') : (c.exams || 'None')}</div>
                                )} />
                                <Row label="Highlights" data={colleges} render={(c) => (
                                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                                        {c.badges?.slice(0, 3).map((b: string) => <li key={b}>{b}</li>)}
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
            {[...Array(Math.max(0, 3 - data.length))].map((_, i) => <td key={`empty-${i}`} className="p-4 bg-gray-50/5 border-r last:border-r-0"></td>)}
        </tr>
    );
}
