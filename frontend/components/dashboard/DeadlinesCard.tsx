"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Clock, ArrowRight, Plus, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddExamModal } from "./AddExamModal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface DeadlinesProps {
    deadlines: any[];
}

export function DeadlinesCard({ deadlines }: DeadlinesProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Sort deadlines by date
    const sortedDeadlines = [...deadlines].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get deadline color based on urgency
    const getDeadlineColor = (date: string) => {
        const daysUntil = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) return 'bg-red-500';
        if (daysUntil <= 30) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Clock size={20} />
                        </div>
                        <CardTitle>Important Deadlines</CardTitle>
                    </div>

                    <AddExamModal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus size={18} />
                        </Button>
                    </AddExamModal>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {sortedDeadlines.length > 0 ? (
                        <div className="space-y-4">
                            {sortedDeadlines.slice(0, 4).map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 group"
                                >
                                    {/* Dot indicator */}
                                    <div className="mt-1.5 relative">
                                        <div className={`w-2.5 h-2.5 rounded-full ${getDeadlineColor(item.date)}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.type} • <span className="font-medium text-amber-600">
                                                {new Date(item.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <CalendarDays className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">No upcoming deadlines</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Exam
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <button
                    onClick={() => router.push('/exams-deadlines')}
                    className="mt-4 flex items-center justify-center w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                    See All Deadlines
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </CardContent>
        </Card>
    );
}
