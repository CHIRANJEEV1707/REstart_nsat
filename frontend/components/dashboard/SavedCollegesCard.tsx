"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bookmark, ArrowRight, Heart } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useRouter } from "next/navigation";

interface SavedCollegesProps {
    colleges: any[];
    count: number;
}

export function SavedCollegesCard({ colleges, count }: SavedCollegesProps) {
    const { openCollegeDetails } = useDashboard();
    const router = useRouter();

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                            <Bookmark size={20} />
                        </div>
                        <CardTitle>Saved Colleges</CardTitle>
                    </div>
                    <Badge className="bg-gray-100 text-gray-600 border-0 font-semibold">
                        {count}
                    </Badge>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {colleges.length > 0 ? (
                        <div className="space-y-3">
                            {colleges.slice(0, 3).map((col) => (
                                <div
                                    key={col._id}
                                    onClick={() => openCollegeDetails(col._id)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer group"
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold flex-shrink-0 group-hover:border-rose-200">
                                        {col.name?.[0] || 'C'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-rose-700">
                                            {col.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {col.location?.city || col.city || 'Location N/A'}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight
                                        size={16}
                                        className="text-gray-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <Heart className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No colleges saved yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Save colleges while browsing to compare later
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <button
                    onClick={() => router.push('/saved')}
                    className="mt-4 flex items-center justify-center w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                    View All Saved
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </CardContent>
        </Card>
    );
}
