"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from 'next/link';

export default function InternationalCountryPage() {
    const router = useRouter();
    const params = useParams();
    // decodeURIComponent is theoretically handled by Next.js params, but explicit decoding for safety if the param comes raw
    const countryName = params.country ? decodeURIComponent(params.country as string) : '';

    const { data: response, isLoading } = useQuery({
        queryKey: ['international-colleges', 'country', countryName],
        queryFn: async () => {
            if (!countryName) return { data: [] };
            const res = await api.get(`/international-colleges?country=${countryName}`);
            return res.data;
        },
        enabled: !!countryName
    });

    const colleges = response?.data || [];

    if (!countryName) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-20">
                <p className="text-gray-500 mb-4">No country specified.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            <div className="mb-10">
                <Link
                    href="/international"
                    className="text-indigo-600 font-bold mb-4 inline-flex items-center gap-2 hover:underline"
                >
                    <ArrowLeft size={16} /> Back to Countries
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Study in {countryName}</h1>
                <p className="text-gray-600">Top universities, admission requirements, and scholarship info.</p>
            </div>

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)}
                </div>
            ) : (
                <>
                    {colleges.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {colleges.map((college: any) => (
                                <Card key={college._id} className="overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group relative bg-white border-gray-100">
                                    <div className="h-48 bg-gray-100 relative">
                                        {/* Placeholder for image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
                                            🏛️
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                            {college.city}
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">#{college.global_ranking} Global</Badge>
                                            {college.badges?.slice(0, 2).map((b: string) => (
                                                <Badge key={b} variant="secondary" className="bg-green-50 text-green-700">{b}</Badge>
                                            ))}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {college.name}
                                        </h3>

                                        <div className="space-y-3 mb-6 text-sm text-gray-600">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                <span>Tuition:</span>
                                                <span className="font-semibold text-gray-900">${college.tuition_fee_annual?.toLocaleString()}/yr</span>
                                            </div>
                                            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                                                <span>Exams:</span>
                                                <span className="font-semibold text-gray-900 text-right">
                                                    {[...college.entrance_exams || [], ...college.english_tests || []].join(', ')}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => router.push(`/college/${college._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No colleges found for {countryName}</h3>
                            <p className="text-gray-500">We are adding more universities soon.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
