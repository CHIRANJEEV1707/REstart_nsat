import Link from "next/link";
import { Search, GraduationCap, Calendar, Bookmark, ArrowLeftRight, Globe, ChevronRight } from "lucide-react";

export function QuickTools() {
    const tools = [
        { name: 'Search', icon: Search, href: '/discover', color: 'bg-blue-100 text-blue-600' },
        { name: 'Exams', icon: GraduationCap, href: '/exams', color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Dates', icon: Calendar, href: '/deadlines', color: 'bg-amber-100 text-amber-600' },
        { name: 'Saved', icon: Bookmark, href: '/saved', color: 'bg-pink-100 text-pink-600' },
        { name: 'Compare', icon: ArrowLeftRight, href: '/compare', color: 'bg-emerald-100 text-emerald-600' },
        { name: 'Global', icon: Globe, href: '/international', color: 'bg-cyan-100 text-cyan-600' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Quick Tools</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.name}
                        href={tool.href}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${tool.color} transition-colors`}>
                            <tool.icon size={18} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{tool.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
