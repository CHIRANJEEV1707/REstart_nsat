import { Card, CardContent } from "@/components/ui/Card";
import { ArrowRight, ArrowLeftRight, ChevronDown, Building2 } from "lucide-react";
import Link from "next/link";

export function CompareCard() {
    return (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-none shadow-lg text-white h-full relative overflow-hidden flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                        <ArrowLeftRight size={16} />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Compare Colleges</h3>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    Confused? Compare fees, placements, and cutoffs side-by-side to decide better.
                </p>

                {/* Visual Comparison Elements */}
                <div className="flex-1 flex flex-col justify-center space-y-3 mb-6">
                    {/* Visual Preview */}
                    <div className="flex items-center justify-center gap-3 mb-2 relative">
                        {/* College A Placeholder */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-1/2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                <Building2 size={14} />
                            </div>
                            <div className="h-2 w-12 bg-white/10 rounded"></div>
                        </div>

                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-900 z-10 shadow-lg">
                            <span className="text-[10px] font-bold">VS</span>
                        </div>

                        {/* College B Placeholder */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-1/2 flex items-center justify-end gap-2 text-right">
                            <div className="h-2 w-12 bg-white/10 rounded"></div>
                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
                                <Building2 size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Mock Dropdowns */}
                    <div className="space-y-2">
                        <div className="h-9 w-full bg-white/5 border border-white/10 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400">
                            <span>Select College A</span>
                            <ChevronDown size={12} />
                        </div>
                        <div className="h-9 w-full bg-white/5 border border-white/10 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400">
                            <span>Select College B</span>
                            <ChevronDown size={12} />
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    href="/compare"
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                >
                    Start Comparison <ArrowRight size={16} />
                </Link>
            </CardContent>
        </Card>
    );
}
