"use strict";
"use client";

import React, { useEffect, useState } from 'react';
import { useCompare, CompareItem } from '@/context/CompareContext';
import { useDashboard } from '@/context/DashboardContext';
import api from '@/lib/axios';
import { X, Check, Minus, Info, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// Normalized College Data Interface for Comparison
interface NormalizedCollege {
    id: string;
    type: string;
    name: string;
    image: string;
    location: string;
    degree: string;
    fees: string;
    exams: string[];
    admission_mode: string;
    placement_support: boolean;
    highlights: string[];
    // Conditional / Extra fields
    details: any;
}

export default function CompareView() {
    const { compareItems, removeFromCompare } = useCompare();
    const { setActiveView, openCollegeDetails } = useDashboard();
    const [collegeData, setCollegeData] = useState<NormalizedCollege[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (compareItems.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const promises = compareItems.map(async (item) => {
                    let endpoint = `/colleges/${item.collegeId}`;
                    if (item.collegeType === 'international') endpoint = `/international-colleges/${item.collegeId}`;
                    if (item.collegeType === 'newgen') endpoint = `/newgen-colleges/${item.collegeId}`;

                    // Handling potential API differences or errors gracefully
                    try {
                        // For this demo, assuming standard REST endpoints or mocking if they fail
                        // Ideally backend supports batch fetch or individual fetch by ID works.
                        // If individual endpoints don't strictly exist like this, we might need a search param or similar.
                        // Given previous context, detailed get by ID likely exists.
                        const res = await api.get(endpoint);
                        const data = res.data.data || res.data; // Handle common wrapper patterns
                        return normalizeData(item, data);
                    } catch (err) {
                        console.error(`Failed to fetch ${item.collegeId}`, err);
                        toast.error(`Failed to load ${item.name}`);
                        // Return partial data from basket if fetch fails
                        return {
                            id: item.collegeId,
                            type: item.collegeType,
                            name: item.name,
                            image: item.image || '',
                            location: 'N/A',
                            degree: 'N/A',
                            fees: 'N/A',
                            exams: [],
                            admission_mode: item.collegeType === 'newgen' ? 'Selection Process' : 'Merit Based',
                            placement_support: false,
                            highlights: [],
                            details: {}
                        } as NormalizedCollege;
                    }
                });

                const results = await Promise.all(promises);
                setCollegeData(results);
            } catch (error) {
                console.error("Compare fetch error", error);
                toast.error("Failed to load comparison data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [compareItems]);

    const normalizeData = (item: CompareItem, data: any): NormalizedCollege => {
        // Helper to format currency
        const formatMoney = (val: any, currency: string) => {
            if (!val) return 'N/A';
            return currency === 'USD' ? `$${val.toLocaleString()}` : `₹${val.toLocaleString()}`;
        };

        const isNewGen = item.collegeType === 'newgen';
        const isIntl = item.collegeType === 'international';

        // Extracting common fields with fallbacks
        const locationStr = data.location ?
            (typeof data.location === 'object' ? `${data.location.city}, ${data.location.state || data.country || ''}` : data.location)
            : `${data.city || ''}, ${data.country || 'India'}`;

        const feesVal = data.fees || data.tuition_fee_annual || data.program_fee || 0;
        const cur = data.currency || (isIntl ? 'USD' : 'INR');

        return {
            id: item.collegeId,
            type: item.collegeType,
            name: data.name || item.name,
            image: data.image || data.logo || item.image || '',
            location: locationStr,
            degree: data.degree || (isIntl ? 'MS / BS' : 'B.Tech / B.E.'),
            fees: formatMoney(feesVal, cur),
            exams: data.exams_required || [],
            admission_mode: data.admission_mode || (isNewGen ? 'Tech-First Selection' : (isIntl ? 'Application Based' : 'Counselling / Merit')),
            placement_support: isNewGen ? true : (data.placement_stats ? true : false),
            highlights: data.highlights || data.features || (data.badges ? data.badges.slice(0, 3) : []),
            details: data // Store raw for specific fields if needed
        };
    };

    if (compareItems.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Info size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Compare Colleges</h2>
                <p className="text-gray-500 max-w-md mb-6">
                    Add at least 2 colleges to see a detailed side-by-side comparison.
                    You can add Indian, International, or New-Gen colleges.
                </p>
                <Button onClick={() => setActiveView('discover-indian')}>
                    Browse Colleges
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Compare Colleges</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Analyzing {collegeData.length} colleges across {new Set(collegeData.map(c => c.type)).size} categories
                    </p>
                </div>
                <Button variant="outline" onClick={() => setActiveView('discover-indian')}>
                    + Add More
                </Button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="p-4 w-48 font-medium text-gray-500 text-sm border-b border-r border-gray-100 sticky left-0 bg-gray-50/95 backdrop-blur-sm z-10">
                                College
                            </th>
                            {collegeData.map(college => (
                                <th key={college.id} className="p-4 min-w-[280px] border-b border-gray-100 align-top relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => removeFromCompare(college.id)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                            {college.image ? (
                                                <img src={college.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {college.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                                                {college.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 capitalize">
                                                {college.type.replace('-', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Overview Section */}
                        <tr className="bg-gray-50/30">
                            <td colSpan={collegeData.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                Overview
                            </td>
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Location</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800">{c.location}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Degree</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800">{c.degree}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Annual Fees</td>
                            {collegeData.map(c => (
                                <td key={c.id} className={`p-4 text-sm font-semibold ${c.type === 'newgen' ? 'text-emerald-600' : 'text-gray-900'}`}>{c.fees}</td>
                            ))}
                        </tr>

                        {/* Academics & Admissions */}
                        <tr className="bg-gray-50/30">
                            <td colSpan={collegeData.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                Admissions
                            </td>
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Exams Accepted</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800">
                                    <div className="flex flex-wrap gap-1">
                                        {c.exams.length > 0 ? c.exams.map(e => (
                                            <span key={e} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{e}</span>
                                        )) : <span className="text-gray-400 italic">None / Merit</span>}
                                    </div>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Admission Mode</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800">{c.admission_mode}</td>
                            ))}
                        </tr>

                        {/* Highlights / Features */}
                        <tr className="bg-gray-50/30">
                            <td colSpan={collegeData.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                                Highlights
                            </td>
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Key Features</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800 align-top">
                                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                                        {c.highlights.map((h, i) => (
                                            <li key={i}>{h}</li>
                                        ))}
                                    </ul>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 text-sm font-medium text-gray-600 border-r border-gray-50 sticky left-0 bg-white z-10">Placement Support</td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4 text-sm text-gray-800">
                                    {c.placement_support ? (
                                        <div className="flex items-center text-emerald-600 gap-1 font-medium text-xs">
                                            <Check size={14} /> Available
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-400 gap-1 text-xs">
                                            <Minus size={14} /> Not Explicit
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Actions */}
                        <tr className="bg-gray-50/10">
                            <td className="p-4 border-r border-gray-50 sticky left-0 bg-white z-10"></td>
                            {collegeData.map(c => (
                                <td key={c.id} className="p-4">
                                    <Button onClick={() => openCollegeDetails(c.id, c.type as any)} className="w-full text-xs">
                                        View Full Profile <ArrowRight size={12} className="ml-1" />
                                    </Button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
