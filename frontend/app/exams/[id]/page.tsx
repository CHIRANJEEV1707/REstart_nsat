"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExamDetailPage() {
    const { id } = useParams();
    const { data: response, isLoading } = useQuery({
        queryKey: ['exam', id],
        queryFn: async () => {
            const res = await api.get(`/exams/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const exam = response?.data;

    if (isLoading) return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-32 px-6">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <Skeleton className="h-6 w-full mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    );

    if (!exam) return <div className="text-center pt-32">Exam not found</div>;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-32 pb-20 px-6">
                <div className="mb-10">
                    <Link href="/exams-deadlines" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Exams
                    </Link>
                    <div>
                        <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase mb-2 block">{exam.code}</span>
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">{exam.name}</h1>
                        <p className="text-xl text-gray-600 leading-relaxed">{exam.description}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <DateCard label="Registration Starts" date={exam.dates?.registration_start} color="blue" />
                    <DateCard label="Registration Ends" date={exam.dates?.registration_end} color="red" />
                    <DateCard label="Exam Date" date={exam.dates?.exam_date_start} color="green" />
                    <DateCard label="Result Date" date={exam.dates?.exam_date_end} color="purple" />
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Eligibility Criteria</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exam.eligibility || "Check official website for details."}</p>

                    <div className="mt-8 flex gap-4">
                        <Button asChild>
                            <a href={exam.website} target="_blank" rel="noopener noreferrer">Visit Official Website</a>
                        </Button>
                        <Button variant="outline">Download Syllabus</Button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function DateCard({ label, date, color }: { label: string, date: string, color: string }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        red: "bg-red-50 text-red-700 border-red-100",
        green: "bg-green-50 text-green-700 border-green-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
    }[color] || "bg-gray-50 text-gray-700 border-gray-100";

    return (
        <div className={`p-6 rounded-2xl border ${colorClasses}`}>
            <p className="text-sm font-semibold opacity-80 mb-1">{label}</p>
            <p className="text-2xl font-bold">{date ? new Date(date).toLocaleDateString() : 'TBA'}</p>
        </div>
    )
}
