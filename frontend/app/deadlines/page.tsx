"use client";

import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from 'next/link';
import { Button } from "@/components/ui/Button";

interface Exam {
    _id: string;
    name: string;
    description: string;
    dates: {
        registration_start: string;
        registration_end: string;
        exam_date_start: string;
    };
}

export default function DeadlinesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['exams'],
        queryFn: async () => (await api.get('/exams')).data
    });

    // Helper to format date
    const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
    });

    const isUpcoming = (date: string) => new Date(date) > new Date();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Important Deadlines</h1>
                        <p className="text-gray-500">Track all application and exam dates</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-6 relative border-l-2 border-indigo-100 ml-4 pl-8">
                        {data?.data.map((exam: Exam) => (
                            <div key={exam._id} className="relative mb-12 last:mb-0">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm ring-1 ring-indigo-100"></div>

                                <Card className="overflow-hidden hover:shadow-lg transition-all border-gray-200">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900 text-lg">{exam.name}</h3>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/exams/${exam._id}`}>View Exam</Link>
                                        </Button>
                                    </div>
                                    <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                                        <div className={`space-y-1 ${isUpcoming(exam.dates.registration_end) ? 'text-amber-700' : 'text-gray-400'}`}>
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
                                                <Clock size={14} /> Registration Ends
                                            </div>
                                            <p className="font-semibold text-lg">{formatDate(exam.dates.registration_end)}</p>
                                        </div>
                                        <div className="space-y-1 text-indigo-700">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
                                                <Calendar size={14} /> Exam Date
                                            </div>
                                            <p className="font-semibold text-lg">{formatDate(exam.dates.exam_date_start)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
