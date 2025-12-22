"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from 'next/link';
import CollegeCard from "@/components/colleges/CollegeCard";
import { College } from "@/types/college";
import { useMemo } from "react";

export default function InternationalCountryPage() {
    const router = useRouter();
    const params = useParams();

    // Safety check for decoding
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

    // Map raw response to College interface
    const colleges: College[] = useMemo(() => {
        const data = response?.data || [];
        return data.map((item: any) => ({
            _id: item._id,
            collegeId: item._id,
            name: item.name,
            image: item.image || '',
            location: { city: item.city || '', state: item.country || countryName },
            country: item.country || countryName,
            fees: Number(item.tuition_fee_annual || 0),
            currency: 'USD', // International defaults to USD usually
            exams_required: [...(item.entrance_exams || []), ...(item.english_tests || [])],
            restart_score: Number(item.restart_score || 0),
            badges: item.badges || [],
            placement_stats: { average_package: 'N/A', highest_package: 'N/A' },
            financialSupportPercent: 0,
            tags: [],
            detailPageSlug: `/college/${item._id}`,
            admission_mode: 'International'
        }));
    }, [response]);

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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
                </div>
            ) : (
                <>
                    {colleges.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {colleges.map((college) => (
                                <CollegeCard
                                    key={college.collegeId}
                                    college={college}
                                    variant="international"
                                    onClick={() => router.push(`/college/${college.collegeId}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No colleges found for {countryName}</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We are actively adding universities to our database. Please check back soon or try another country.
                            </p>
                            <Button variant="outline" className="mt-6" onClick={() => router.push('/international')}>
                                Browse All Countries
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
