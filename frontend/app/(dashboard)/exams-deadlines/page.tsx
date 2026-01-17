"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Exam {
    _id: string;
    name: string;
    code: string;
    description: string;
    dates: { exam_date_start: string };
}

export default function ExamsDeadlinesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: examsPayload, isLoading: isExamsLoading } = useQuery({
        queryKey: ['exams'],
        queryFn: async () => {
            const res = await api.get('/exams');
            return res.data;
        }
    });

    const { data: userExamsPayload, isLoading: isUserExamsLoading } = useQuery({
        queryKey: ['user-exams'],
        queryFn: async () => {
            const res = await api.get('/user/exams');
            return res.data;
        }
    });

    const toggleExamMutation = useMutation({
        mutationFn: async ({ examId, isTracked }: { examId: string, isTracked: boolean }) => {
            if (isTracked) {
                await api.delete('/user/exams', { data: { examId } });
            } else {
                await api.post('/user/exams', { examId });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-exams'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success("Exam list updated successfully");
        },
        onError: () => {
            toast.error("Failed to update exam list");
        }
    });

    const isLoading = isExamsLoading || isUserExamsLoading;
    const trackedExamIds = userExamsPayload?.data?.map((e: any) => e._id) || [];

    // Sort exams by date
    const sortedExams = examsPayload?.data ? [...examsPayload.data].sort((a: Exam, b: Exam) => {
        return new Date(a.dates?.exam_date_start).getTime() - new Date(b.dates?.exam_date_start).getTime();
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-16 mb-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Exam Season Timeline</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Your comprehensive roadmap to engineering success. Scroll down to see upcoming exams chronologicaly and add them to your prep dashboard.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 relative">
                {/* Vertical Timeline Line */}
                {!isLoading && (
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-100 transform md:-translate-x-1/2"></div>
                )}

                {isLoading ? (
                    <div className="space-y-12">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-24 pb-24">
                        {sortedExams.map((exam: Exam, index: number) => {
                            const isTracked = trackedExamIds.includes(exam._id);
                            const isToggling = toggleExamMutation.isPending && toggleExamMutation.variables?.examId === exam._id;
                            const isEven = index % 2 === 0;
                            const examDate = new Date(exam.dates?.exam_date_start);
                            const month = examDate.toLocaleString('default', { month: 'short' });
                            const day = examDate.getDate();

                            return (
                                <motion.div
                                    key={exam._id}
                                    initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                                    className={`relative flex flex-col md:flex-row items-center md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.2)] transform -translate-x-2 md:-translate-x-1/2 z-10 top-0 md:top-8 mt-6 md:mt-0"></div>

                                    {/* Date Marker (Desktop Center) */}
                                    <div className="hidden md:flex absolute left-1/2 top-8 transform -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center justify-center w-16 h-16 bg-white rounded-full border-2 border-indigo-100 shadow-sm">
                                        <span className="text-xs font-bold text-indigo-600 uppercase">{month}</span>
                                        <span className="text-xl font-bold text-gray-900">{day}</span>
                                    </div>

                                    {/* Empty Space for Alignment */}
                                    <div className="w-full md:w-5/12"></div>

                                    {/* Card Content */}
                                    <div className="w-full md:w-5/12 pl-12 md:pl-0">
                                        <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${isTracked ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                                            {/* decorative gradient */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700 font-medium">
                                                        {exam.code}
                                                    </Badge>
                                                    <span className="md:hidden text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                        {month} {day}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                                    {exam.name}
                                                </h3>
                                                <p className="text-gray-500 mb-6 text-sm line-clamp-3 leading-relaxed">
                                                    {exam.description || "Get ready for one of the most competitive engineering entrance exams. Prep with the best resources available."}
                                                </p>

                                                <div className="flex items-center gap-3 mt-4">
                                                    <Button
                                                        className={`flex-1 transition-all duration-300 ${isTracked ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'} shadow-lg`}
                                                        onClick={() => toggleExamMutation.mutate({ examId: exam._id, isTracked })}
                                                        disabled={isToggling}
                                                    >
                                                        {isToggling ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        ) : isTracked ? (
                                                            <>
                                                                <Check className="w-4 h-4 mr-2" /> Tracked
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="w-4 h-4 mr-2" /> Add to Prep
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="border-gray-200 hover:bg-gray-50"
                                                        onClick={() => router.push(`/exams/${exam._id}`)}
                                                    >
                                                        Details
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
