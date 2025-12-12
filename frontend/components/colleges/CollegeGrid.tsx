"use client";

import { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

interface College {
    _id: string;
    name: string;
    location: { city: string; state: string };
    badges: string[];
    restart_score: number;
    fees: number;
    exams_required: string[];
}

export default function CollegeGrid({ filters }: { filters: any }) {
    const [page, setPage] = useState(1);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['colleges', filters, page],
        queryFn: async () => {
            const params = new URLSearchParams(filters);
            params.append('page', page.toString());
            params.append('limit', '8');
            const res = await api.get(`/colleges?${params.toString()}`);
            return res.data;
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading && !data) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)}
            </div>
        );
    }

    if (isError) return <div className="text-red-500 text-center py-20">Failed to load colleges.</div>;

    if (data?.data.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No colleges found</h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data.map((college: College) => (
                    <Card key={college._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full border-gray-200/60">
                        <div className="h-32 bg-gradient-to-tr from-gray-100 to-gray-200 relative">
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm text-xs font-bold px-3 py-1 rounded-full text-indigo-900 flex items-center gap-1">
                                ★ {college.restart_score}
                            </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {college.badges.slice(0, 3).map(b => (
                                    <Badge key={b} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{b}</Badge>
                                ))}
                                {college.badges.length > 3 && <Badge variant="outline" className="text-gray-400">+{college.badges.length - 3}</Badge>}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
                                {college.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">{college.location.city}, {college.location.state}</p>

                            <div className="mt-auto space-y-3 pt-4 border-t border-gray-100/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Fees</span>
                                    <span className="font-semibold text-gray-900">₹{(college.fees / 100000).toFixed(1)}L / yr</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Exams</span>
                                    <span className="font-medium text-indigo-600 truncate max-w-[120px] text-right">{college.exams_required.join(', ')}</span>
                                </div>
                                <Button className="w-full mt-2" size="lg" asChild>
                                    <Link href={`/college/${college._id}`}>View Details</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            {data?.pagination && (
                <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!data.pagination.prev}
                        className="w-32"
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-gray-600">
                        Page {page}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!data.pagination.next}
                        className="w-32"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
