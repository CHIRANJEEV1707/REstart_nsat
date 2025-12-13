"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useDashboard } from "@/context/DashboardContext";
import { ArrowLeft, Calendar, FileText, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export function ExamDetailsView() {
    const { selectedExamId, goBack } = useDashboard();

    const { data: exam, isLoading, isError } = useQuery({
        queryKey: ['exam', selectedExamId],
        queryFn: async () => {
            if (!selectedExamId) return null;
            const res = await api.get(`/exams/${selectedExamId}`);
            return res.data.data;
        },
        enabled: !!selectedExamId
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError || !exam) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <p className="text-gray-500 mb-4">Exam details not found.</p>
                <Button onClick={goBack}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            {/* Header / Nav */}
            <div className="mb-6">
                <button
                    onClick={goBack}
                    className="text-gray-500 font-medium mb-4 inline-flex items-center gap-2 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Exams
                </button>
            </div>

            {/* Title Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-sm">
                            {exam.code}
                        </Badge>
                        <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100">
                            Registrations Open
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{exam.name}</h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        {exam.description}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Important Dates */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                Important Dates
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-600 font-medium">Exam Date</span>
                                    <span className="text-gray-900 font-bold">
                                        {new Date(exam.dates?.exam_date_start).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-600 font-medium">Registration Start</span>
                                    <span className="text-gray-900">
                                        {new Date(exam.dates?.registration_start).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-600 font-medium">Registration End</span>
                                    <span className="text-red-600 font-semibold">
                                        {new Date(exam.dates?.registration_end).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Eligibility */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                Eligibility Criteria
                            </h3>
                            <ul className="space-y-3">
                                {Array.isArray(exam.eligibility) ? (
                                    exam.eligibility.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <span className="leading-relaxed">{exam.eligibility || "No eligibility criteria listed."}</span>
                                    </li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-indigo-600 text-white border-none shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">Ready to Apply?</h3>
                            <p className="text-indigo-100 text-sm mb-6">Make sure you have all documents ready before starting.</p>

                            <a
                                href={exam.website}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm mb-3"
                            >
                                Visit Official Website
                            </a>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700 group-hover:text-indigo-600">Download Syllabus</span>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400 group-hover:text-indigo-600" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700 group-hover:text-indigo-600">Exam Pattern</span>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400 group-hover:text-indigo-600" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
