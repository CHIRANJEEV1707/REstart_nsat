"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

interface Exam {
    _id: string;
    name: string;
    code: string;
    description: string;
    dates: { exam_date_start: string };
}

export default function ExamsListPage() {
    const { data: response, isLoading } = useQuery({
        queryKey: ['exams'],
        queryFn: async () => {
            const res = await api.get('/exams');
            return res.data;
        }
    });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Entrance Exams</h1>
                    <p className="text-gray-600">Track registration dates, exam schedules, and syllabus for all major engineering exams.</p>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {response?.data.map((exam: Exam) => (
                            <Card key={exam._id} className="hover:shadow-lg transition-all border-gray-200">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                            {exam.code.substring(0, 2)}
                                        </div>
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                            Active
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
                                    <p className="text-gray-500 mb-6 line-clamp-2 h-10">{exam.description || "No description provided."}</p>
                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-sm">
                                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Exam Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(exam.dates?.exam_date_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <Link href={`/exams/${exam._id}`} className="text-indigo-600 font-bold text-sm hover:underline">
                                            View Details
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
