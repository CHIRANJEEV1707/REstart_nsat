"use client";

import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useCompare } from "@/context/CompareContext";

export default function CountryPage() {
    const params = useParams();
    const countryName = Array.isArray(params.country) ? params.country[0] : params.country;
    const decodedCountry = decodeURIComponent(countryName || '');

    const { addToCompare, removeFromCompare, isInCompare } = useCompare();

    const { data, isLoading } = useQuery({
        queryKey: ['international-colleges', 'country', decodedCountry],
        queryFn: async () => {
            const res = await api.get(`/international-colleges?country=${decodedCountry}`);
            return res.data;
        },
        enabled: !!decodedCountry
    });

    const colleges = data?.data || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12">
                    <Link href="/international" className="text-indigo-600 font-bold mb-4 inline-block hover:underline">← Back to Countries</Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Study in {decodedCountry}</h1>
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
                                    <Card key={college._id} className="overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group relative">
                                        <div className="h-48 bg-gray-200 relative">
                                            {/* Placeholder for image */}
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-100">
                                                🏛️
                                            </div>
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {college.city}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    isInCompare(college._id)
                                                        ? removeFromCompare(college._id)
                                                        : addToCompare({ collegeId: college._id, name: college.name, collegeType: 'international' });
                                                }}
                                                className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm transition-all z-10 ${isInCompare(college._id) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'}`}
                                            >
                                                {isInCompare(college._id) ? '✓ Added' : '+ Compare'}
                                            </button>
                                        </div>
                                        <CardContent className="p-6 flex-1 flex flex-col">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">#{college.global_ranking} Global</Badge>
                                                {college.badges?.slice(0, 2).map((b: string) => (
                                                    <Badge key={b} variant="secondary" className="bg-green-50 text-green-700">{b}</Badge>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                                <Link href={`/international/college/${college._id}`} className="hover:text-indigo-600 transition-colors">
                                                    {college.name}
                                                </Link>
                                            </h3>

                                            <div className="space-y-3 mb-6 text-sm text-gray-600">
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                    <span>Tuition:</span>
                                                    <span className="font-semibold text-gray-900">${college.tuition_fee_annual?.toLocaleString()}/yr</span>
                                                </div>
                                                <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                                                    <span>Exams:</span>
                                                    <span className="font-semibold text-gray-900 text-right">
                                                        {[...college.entrance_exams, ...college.english_tests].join(', ')}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button className="w-full mt-auto" asChild>
                                                <Link href={`/international/college/${college._id}`}>View Details</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No colleges found for {decodedCountry}</h3>
                                <p className="text-gray-500">We are adding more universities soon.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
