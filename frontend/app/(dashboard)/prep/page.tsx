'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, BookOpen, GraduationCap, Globe, Calculator, Binary, PenTool } from 'lucide-react';

const exams = [
    {
        id: 'nsat',
        title: 'NSAT',
        subtitle: 'Newton School Aptitude Test',
        icon: BookOpen,
        image: '/images/nsat-logo.svg',
        color: 'blue',
        href: '/prep/nsat',
        status: 'active'
    },
    {
        id: 'jee-mains',
        title: 'JEE Mains',
        subtitle: 'Joint Entrance Examination Main',
        icon: Calculator,
        image: '/images/jeemains.svg',
        color: 'orange',
        href: '/prep/jee-mains',
        status: 'active'
    },
    {
        id: 'jee-advanced',
        title: 'JEE Advanced',
        subtitle: 'Joint Entrance Examination Advanced',
        icon: Calculator,
        image: '/images/jeeadv.svg',
        color: 'red',
        href: '/prep/jee-advanced',
        status: 'active'
    },
    {
        id: 'bitsat',
        title: 'BITSAT',
        subtitle: 'Birla Institute Technical Test',
        icon: Binary,
        image: '/images/bitsat.svg',
        color: 'red',
        href: '/prep/bitsat',
        status: 'active'
    },
    {
        id: 'sat',
        title: 'SAT',
        subtitle: 'Scholastic Assessment Test',
        icon: Globe,
        color: 'purple',
        href: '/prep/sat',
        status: 'coming-soon'
    },
    {
        id: 'psat',
        title: 'PSAT',
        subtitle: 'Preliminary SAT',
        icon: PenTool,
        color: 'indigo',
        href: '/prep/psat',
        status: 'coming-soon'
    },
    {
        id: 'mhcet',
        title: 'MHCET',
        subtitle: 'Maharashtra Health & Tech CET',
        icon: GraduationCap,
        image: '/images/mhtcet.svg',
        color: 'green',
        href: '/prep/mhcet',
        status: 'coming-soon'
    }
];

const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 group-hover:text-blue-700 bg-blue-50 hover:border-blue-200',
    orange: 'bg-orange-100 text-orange-600 group-hover:text-orange-700 bg-orange-50 hover:border-orange-200',
    red: 'bg-red-100 text-red-600 group-hover:text-red-700 bg-red-50 hover:border-red-200',
    purple: 'bg-purple-100 text-purple-600 group-hover:text-purple-700 bg-purple-50 hover:border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-600 group-hover:text-indigo-700 bg-indigo-50 hover:border-indigo-200',
    green: 'bg-green-100 text-green-600 group-hover:text-green-700 bg-green-50 hover:border-green-200',
};

export default function PrepHubPage() {
    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 page-transition">
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Prep Hub</h1>
                    <p className="text-gray-600">Select an exam to start your preparation.</p>
                </div>

                {/* Exam Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => {
                        const Icon = exam.icon;
                        const [bgBase, textBase] = colorMap[exam.color].split(' group-hover');

                        // Applying specific color parts
                        const bgLight = `bg-${exam.color}-50`;
                        const bgIcon = exam.image ? 'bg-white' : `bg-${exam.color}-100`; // White bg for actual logos
                        const textIcon = `text-${exam.color}-600`;
                        const borderHover = `hover:border-${exam.color}-200`;

                        const cardClasses = `group bg-white rounded-2xl border border-gray-100 transition-all overflow-hidden flex flex-col items-center text-center p-8 relative ${exam.status === 'active'
                            ? `${borderHover} hover:shadow-lg cursor-pointer`
                            : 'opacity-90 hover:border-gray-200 cursor-not-allowed grayscale-[0.3] hover:grayscale-0'
                            }`;

                        return (
                            <Link
                                href={exam.status === 'active' ? exam.href : '#'}
                                key={exam.id}
                                className={cardClasses}
                                onClick={(e) => exam.status !== 'active' && e.preventDefault()}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${bgLight}`}></div>

                                {/* Logo / Icon Container */}
                                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform relative z-10 p-4 ${bgIcon} ${exam.image ? 'shadow-sm border border-gray-50' : ''}`}>
                                    {exam.image ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={exam.image}
                                                alt={`${exam.title} Logo`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <Icon className={`w-10 h-10 ${textIcon}`} />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 transition-colors relative z-10">{exam.title}</h3>
                                <Badge variant="secondary" className="mb-6 relative z-10">{exam.subtitle}</Badge>

                                <div className="mt-auto relative z-10 h-6">
                                    {exam.status === 'active' ? (
                                        <span className={`inline-flex items-center font-medium group-hover:gap-2 transition-all ${textIcon}`}>
                                            Enter Prep <ArrowRight className="w-4 h-4 ml-1" />
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm font-medium">Coming Soon</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
