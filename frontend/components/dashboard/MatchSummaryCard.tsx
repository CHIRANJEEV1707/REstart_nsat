import { Card, CardContent } from "@/components/ui/Card";
import { MoveRight, Target, MapPin, IndianRupee } from "lucide-react";
import Link from "next/link";

interface MatchSummaryProps {
    data: {
        total_matches: number;
        score_range: string;
    };
    user: {
        state?: string;
    }
}

export function MatchSummaryCard({ data, user }: MatchSummaryProps) {
    return (
        <Card className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 border-none shadow-xl text-white relative overflow-hidden h-full">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <Target size={200} />
            </div>

            <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-100">
                        <Target size={18} />
                        <span className="text-sm font-medium tracking-wide uppercase">College Fit Analysis</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">You matched with <span className="text-white border-b-2 border-yellow-400 pb-0.5">{data.total_matches} Colleges</span></h2>
                    <p className="text-indigo-100 max-w-md">Based on your preference for <strong>{user.state || 'India'}</strong> and budget.</p>

                    <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="font-bold text-lg">82%</span>
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Avg Fit<br />Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <IndianRupee size={16} />
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Budget<br />Match</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <MapPin size={16} />
                            </div>
                            <span className="text-xs text-indigo-100 leading-tight">Loc<br />Pref</span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/discover"
                    className="flex-shrink-0 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2"
                >
                    View Top Matches <MoveRight size={18} />
                </Link>
            </CardContent>
        </Card>
    );
}
