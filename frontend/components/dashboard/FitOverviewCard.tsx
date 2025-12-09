import { Card, CardContent } from "@/components/ui/Card";
import { MoveRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface FitOverviewProps {
    data: {
        total_matches: number;
        score_range: string;
    };
}

export function FitOverviewCard({ data }: FitOverviewProps) {
    return (
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none shadow-lg text-white relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
            </div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                    <h3 className="font-semibold text-indigo-100 mb-1">Your College Fit</h3>
                    <div className="text-4xl font-bold mb-2">{data.total_matches}</div>
                    <p className="text-indigo-100 text-sm">Colleges match your profile.</p>
                </div>

                <div className="mt-6">
                    <div className="text-xs text-indigo-200 uppercase font-semibold tracking-wider mb-1">Fit Score Range</div>
                    <div className="text-2xl font-bold">{data.score_range}</div>

                    <Link href="/discover" className="mt-4 flex items-center text-sm font-semibold hover:text-indigo-200 transition-colors w-fit group">
                        View Recommendations <MoveRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
