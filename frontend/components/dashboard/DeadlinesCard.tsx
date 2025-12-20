import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DeadlinesProps {
    deadlines: any[];
}

export function DeadlinesCard({ deadlines }: DeadlinesProps) {
    const router = useRouter();
    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock size={20} />
                    </div>
                    <CardTitle className="text-lg">Important Deadlines</CardTitle>
                </div>

                <div className="space-y-0 flex-1 relative">
                    {deadlines.length > 0 ? (
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 py-2">
                            {deadlines.map((item, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white"></div>
                                    <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.type} • <span className="text-amber-600 font-medium">{new Date(item.date).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-6 text-center">No upcoming deadlines.</p>
                    )}
                </div>

                <button onClick={() => router.push('/exams-deadlines')} className="mt-6 flex items-center justify-center w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    See All Deadlines <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </CardContent>
        </Card>
    );
}
