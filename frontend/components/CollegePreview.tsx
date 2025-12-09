'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// Define Interface
interface College {
    _id: string; // MongoDB ID
    name: string;
    location: {
        city: string;
        state: string;
    };
    badges: string[];
    restart_score: number;
    fees: number;
    exams_required: string[];
    type: string;
}

// Fetcher Function
const fetchTopColleges = async (): Promise<College[]> => {
    const { data } = await api.get('/colleges?limit=3&sort=-restart_score');
    return data.data; // data.data because backend sends { success: true, count: N, data: [] }
};

export default function CollegePreview() {
    const { data: colleges, isLoading, isError } = useQuery({
        queryKey: ['topColleges'],
        queryFn: fetchTopColleges
    });

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Top Colleges</h2>
                        <p className="text-lg text-gray-600">Explore trusted engineering institutes based on real data.</p>
                    </div>
                    <Link href="/colleges" className="hidden md:flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                        View All Colleges <span className="ml-2">→</span>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Loading colleges...</div>
                ) : isError ? (
                    <div className="text-center py-20 text-red-500">Failed to load colleges. Check your connection.</div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {colleges?.map((college, idx) => (
                            <div key={college._id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                {/* Dynamic color based on index or type for variety, since backend doesn't store color */}
                                <div className={`h-40 ${idx % 3 === 0 ? 'bg-blue-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-indigo-600'} relative`}>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-gray-800 flex items-center gap-1">
                                        <span>★</span> {college.restart_score}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex gap-2 mb-3">
                                        {college.badges.slice(0, 2).map(badge => (
                                            <span key={badge} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">{college.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{college.location.city}, {college.location.state}</p>

                                    <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Fees</span>
                                            <span className="font-semibold text-gray-900">₹{(college.fees / 100000).toFixed(1)}L / year</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Exam</span>
                                            {/* Show first exam */}
                                            <span className="font-semibold text-indigo-600">{college.exams_required[0] || 'Direct'}</span>
                                        </div>
                                        <Link href={`/colleges/${college._id}`} className="block w-full mt-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-indigo-600 transition-colors text-center">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center md:hidden">
                    <Link href="/colleges" className="inline-flex items-center text-indigo-600 font-bold">
                        View All Colleges →
                    </Link>
                </div>
            </div>
        </section>
    );
}
