import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Sparkles, ArrowRight, Gauge, IndianRupee } from "lucide-react";
import Link from "next/link";

interface RecommendedProps {
    colleges: any[];
}

export function RecommendedCollegesCard({ colleges }: RecommendedProps) {
    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                        <Sparkles size={20} />
                    </div>
                    <CardTitle className="text-lg">Recommended For You</CardTitle>
                </div>

                <div className="space-y-4 flex-1">
                    {colleges.map((col) => (
                        <div key={col._id} className="group p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:shadow-sm transition-all bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">{col.name}</h4>
                                <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                    <Gauge className="w-3 h-3 mr-1" /> {col.fit_score}% Match
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                    <IndianRupee className="w-3 h-3 mr-1" /> {col.fees}
                                </div>
                                <div className="px-1.5 py-0.5 rounded-md bg-gray-100 font-medium">
                                    {col.exam}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/discover" className="mt-6 flex items-center justify-center w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    Explore Colleges <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </CardContent>
        </Card>
    );
}
