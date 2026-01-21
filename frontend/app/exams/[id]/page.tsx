"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Calendar, UserCheck, GraduationCap, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

    // Timeline Events Constructor
    const timelineEvents = exam?.dates ? [
        {
            title: "Registration Starts",
            date: exam.dates.registration_start,
            icon: UserCheck,
            color: "blue",
            description: "Applications open for all candidates."
        },
        {
            title: "Registration Ends",
            date: exam.dates.registration_end,
            icon: Calendar,
            color: "red",
            description: "Last date to submit application forms."
        },
        {
            title: "Exam Date",
            date: exam.dates.exam_date_start,
            icon: GraduationCap,
            color: "green",
            description: "The main examination day."
        },
        {
            title: "Result Declaration",
            date: exam.dates.exam_date_end,
            icon: Award,
            color: "blue",
            description: "Expected date for results and rank announcements."
        }
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];


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
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-5xl mx-auto pt-32 pb-20 px-6">
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <Link href="/exams-deadlines" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Exams
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block bg-blue-50 w-fit mx-auto px-4 py-1 rounded-full">{exam.code}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{exam.name}</h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">{exam.description}</p>
                    </motion.div>
                </div>

                {/* Vertical Timeline Section */}
                <div className="relative mb-20 max-w-3xl mx-auto">
                    {/* Central Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform md:-translate-x-1/2"></div>

                    <div className="space-y-12">
                        {timelineEvents.map((event, index) => {
                            const isEven = index % 2 === 0;
                            const Icon = event.icon;
                            // Colors map
                            const theme = {
                                blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
                                red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
                                green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
                                sky: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' },
                            }[event.color] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Timeline Node */}
                                    <div className={`absolute left-8 md:left-1/2 w-8 h-8 rounded-full border-4 border-white shadow-md transform -translate-x-1/2 z-10 flex items-center justify-center ${theme.bg}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${theme.bg.replace('100', '500')}`}></div>
                                    </div>

                                    {/* Spacer for Desktop Alignment */}
                                    <div className="hidden md:block w-1/2"></div>

                                    {/* Content Card */}
                                    <div className="w-full md:w-1/2 pl-24 md:pl-0 md:px-12">
                                        <div className={`bg-white p-6 rounded-2xl border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <h3 className="font-bold text-gray-900">{event.title}</h3>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 mb-2">
                                                {event.date ? new Date(event.date).toLocaleDateString(undefined, {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : 'To Be Announced'}
                                            </p>
                                            <p className="text-sm text-gray-500">{event.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <GraduationCap className="text-blue-600" />
                        Eligibility & Resources
                    </h3>
                    <div className="prose prose-indigo max-w-none text-gray-600">
                        <p className="whitespace-pre-line leading-relaxed">{exam.eligibility || "Check official website for complete eligibility criteria."}</p>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <a href={exam.website} target="_blank" rel="noopener noreferrer">Visit Official Website</a>
                        </Button>
                        <Button variant="outline">Download Syllabus PDF</Button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
