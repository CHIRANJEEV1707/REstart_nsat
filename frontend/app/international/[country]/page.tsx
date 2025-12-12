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

export default function CountryPage() {
    // Correctly accessing the params. The issue is likely that useParams returns an object with keys matching file structure.
    // In strict mode / newer Next.js types, explicit casting or checking might be needed.
    // However, useParams<Params>() is standard. Let's just use simple access for now.
    const params = useParams();
    const countryName = Array.isArray(params.country) ? params.country[0] : params.country;

    // Decode if needed (e.g. %20 -> space)
    const decodedCountry = decodeURIComponent(countryName || '');

    const { data, isLoading } = useQuery({
        queryKey: ['colleges', 'country', decodedCountry],
        queryFn: async () => {
            // Pass country as filter
            const res = await api.get(`/colleges?country=${decodedCountry}`);
            return res.data;
        },
        enabled: !!decodedCountry
    });

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
                        {data?.data.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.data.map((college: any) => (
                                    <Card key={college._id} className="overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                                        <div className="h-48 bg-gray-200 relative">
                                            {/* Placeholder for image */}
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {college.location.city}
                                            </div>
                                        </div>
                                        <CardContent className="p-6 flex-1 flex flex-col">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {college.badges.map((b: string) => (
                                                    <Badge key={b} variant="secondary" className="bg-green-50 text-green-700">{b}</Badge>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{college.name}</h3>

                                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>Fees:</span>
                                                    <span className="font-semibold text-gray-900">₹{(college.fees / 100000).toFixed(1)}L/yr</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Exams:</span>
                                                    <span className="font-semibold text-gray-900">{college.exams_required.join(', ')}</span>
                                                </div>
                                            </div>

                                            {college.study_abroad_info && (
                                                <div className="mt-auto pt-4 border-t border-gray-100 text-xs">
                                                    <p className="font-bold text-gray-900 mb-1">Visa Req:</p>
                                                    <p className="text-gray-500">{college.study_abroad_info.visa_requirements.join(', ')}</p>
                                                </div>
                                            )}
                                            <Button className="w-full mt-4" asChild>
                                                <Link href={`/college/${college._id}`}>View Details</Link>
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
