import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function AnnouncementBar() {
    return (
        <div className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 flex items-center justify-center text-sm font-medium relative overflow-hidden">
            <div className="flex items-center gap-2 z-10">
                <Sparkles size={16} className="text-yellow-300" />
                <span>New Feature: Compare colleges side-by-side with updated fees & placements!</span>
                <Link href="/compare" className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition-colors flex items-center">
                    Try Now <ArrowRight size={12} className="ml-1" />
                </Link>
            </div>

            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10"></div>
        </div>
    );
}
