"use client";

import Navbar from "@/components/Navbar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';

export default function PrepPage() {
    const queryClient = useQueryClient();
    const { data: planRes, isLoading } = useQuery({
        queryKey: ['myPlan'],
        queryFn: async () => {
            try {
                const res = await api.get('/prep/plans/my');
                return res.data;
            } catch (e) {
                return null;
            }
        },
        retry: false
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/prep/plans', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPlan'] });
        }
    });

    if (isLoading) return <div className="pt-32 text-center">Loading Plan...</div>;

    const plan = planRes?.data;

    if (!plan) return <CreatePlanView onCreate={(id) => createMutation.mutate({ examId: id, durationWeeks: 8 })} />;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Prep Plan</h1>
                        <p className="text-gray-500">Targeting {plan.exam?.name} • Week 1 of {plan.weeks.length}</p>
                    </div>
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[10%]"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    {plan.weeks.map((week: any, idx: number) => (
                        <WeekAccordion key={idx} week={week} />
                    ))}
                </div>
            </div>
        </main>
    );
}

function CreatePlanView({ onCreate }: { onCreate: (id: string) => void }) {
    // Ideally fetch exams list here, hardcoding ID for demo or need another query
    // Let's assume we pass a hardcoded ID for "JEE Main" found in seed
    // In real app, we show a dropdown of available exams
    const [examId, setExamId] = useState('');

    // Quick fix: Fetch exams to let user pick
    const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: async () => (await api.get('/exams')).data });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">Start Your Preparation</h1>
                <p className="text-gray-500 mb-8">Select your target exam and we'll generate a personalized weekly roadmap.</p>

                <div className="grid gap-4 max-w-md mx-auto">
                    {exams?.data?.map((ex: any) => (
                        <button
                            key={ex._id}
                            onClick={() => onCreate(ex._id)}
                            className="p-4 border rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all font-semibold text-left"
                        >
                            {ex.name}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    )
}

function WeekAccordion({ week }: { week: any }) {
    const [isOpen, setIsOpen] = useState(week.weekNumber === 1);

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 ${isOpen ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'} transition-colors`}
            >
                <span className="font-bold text-lg">Week {week.weekNumber}</span>
                {isOpen ? <ChevronDown /> : <ChevronRight />}
            </button>

            {isOpen && (
                <div className="p-6 bg-white space-y-6">
                    {Object.entries(week.subjects).map(([subject, topics]: [string, any]) => (
                        <div key={subject}>
                            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">{subject}</h4>
                            <div className="space-y-2">
                                {topics.map((topic: string) => (
                                    <div key={topic} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group">
                                        <Circle className="text-gray-300 group-hover:text-indigo-600" size={20} />
                                        <span className="text-gray-700 font-medium">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
