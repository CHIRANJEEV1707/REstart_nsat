
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Sparkles, ArrowRight, Gauge, IndianRupee, Heart, ArrowLeftRight } from "lucide-react";
import Image from "next/image";

import { useDashboard } from "@/context/DashboardContext";

interface RecommendedProps {
    colleges: any[];
}

export function RecommendedCollegesCard({ colleges }: RecommendedProps) {
    const { setActiveView, openCollegeDetails } = useDashboard();
    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                            <Sparkles size={20} />
                        </div>
                        <CardTitle className="text-lg">Recommended For You</CardTitle>
                    </div>
                    <button onClick={() => setActiveView('discover')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                        Explore All
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {colleges.map((col) => (
                        <div key={col._id} className="group relative p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:shadow-md transition-all bg-white flex flex-col">
                            {/* Logo / Image Placeholder */}
                            <div className="h-24 w-full bg-gray-50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                                {col.logo ? (
                                    <Image src={col.logo} alt={col.name} width={60} height={60} className="object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-300">{col.name[0]}</span>
                                )}
                                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-pink-500 shadow-sm transition-colors">
                                    <Heart size={14} />
                                </button>
                            </div>

                            <div className="mb-3 flex-1">
                                <h4 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1 mb-1">{col.name}</h4>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                        <Gauge className="w-3 h-3 mr-1" /> {col.fit_score}% Fit
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
                                        {col.exam}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                    <IndianRupee size={12} className="mr-1" />
                                    {col.fees}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => openCollegeDetails(col._id, 'indian')}
                                    className="flex-1 py-2 text-center text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    View
                                </button>
                                <button className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Compare">
                                    <ArrowLeftRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
