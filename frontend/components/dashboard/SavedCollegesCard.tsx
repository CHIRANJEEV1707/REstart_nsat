import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext";

interface SavedCollegesProps {
    colleges: any[];
    count: number;
}

export function SavedCollegesCard({ colleges, count }: SavedCollegesProps) {
    const { setActiveView, openCollegeDetails } = useDashboard();
    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                            <Bookmark size={20} />
                        </div>
                        <CardTitle className="text-lg">Saved Colleges</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100">{count}</Badge>
                </div>

                <div className="space-y-4 flex-1">
                    {colleges.length > 0 ? (
                        colleges.slice(0, 3).map((col) => (
                            <div
                                key={col._id}
                                onClick={() => openCollegeDetails(col._id, col.type || 'indian')}
                                className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-pink-100 hover:bg-pink-50/50 transition-colors group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">{col.name}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {col.tags?.map((tag: string, i: number) => (
                                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">
                            <p>No colleges saved yet.</p>
                        </div>
                    )}
                </div>

                <button onClick={() => setActiveView('saved')} className="mt-6 flex items-center justify-center w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    View All Saved <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </CardContent>
        </Card>
    );
}
