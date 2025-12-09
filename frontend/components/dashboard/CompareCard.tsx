import { Card, CardContent } from "@/components/ui/Card";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

export function CompareCard() {
    return (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg text-white h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ArrowLeftRight size={100} />
            </div>
            <CardContent className="p-6 flex flex-col h-full justify-between relative z-10">
                <div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-4">
                        <ArrowLeftRight size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Compare Colleges</h3>
                    <p className="text-gray-400 text-sm">
                        Confused between two options? Compare fees, placements, and cutoffs side-by-side.
                    </p>
                </div>

                <Link href="/discover" className="mt-6 flex items-center text-sm font-bold text-white hover:text-indigo-300 transition-colors">
                    Start Comparison <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
