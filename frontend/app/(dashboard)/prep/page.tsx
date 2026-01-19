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
        href: '/prep/nsat',
        status: 'active'
    },
    {
        id: 'jee-mains',
        title: 'JEE Mains',
        subtitle: 'Joint Entrance Examination Main',
        icon: Calculator,
        image: '/images/jeemains.svg',
        href: '/prep/jee-mains',
        status: 'active'
    },
    {
        id: 'jee-advanced',
        title: 'JEE Advanced',
        subtitle: 'Joint Entrance Examination Advanced',
        icon: Calculator,
        image: '/images/jeeadv.svg',
        href: '/prep/jee-advanced',
        status: 'active'
    },
    {
        id: 'bitsat',
        title: 'BITSAT',
        subtitle: 'Birla Institute Technical Test',
        icon: Binary,
        image: '/images/bitsat.svg',
        href: '/prep/bitsat',
        status: 'active'
    },
    {
        id: 'sat',
        title: 'SAT',
        subtitle: 'Scholastic Assessment Test',
        icon: Globe,
        href: '/prep/sat',
        status: 'coming-soon'
    },
    {
        id: 'psat',
        title: 'PSAT',
        subtitle: 'Preliminary SAT',
        icon: PenTool,
        href: '/prep/psat',
        status: 'coming-soon'
    },
    {
        id: 'mhcet',
        title: 'MHCET',
        subtitle: 'Maharashtra Health & Tech CET',
        icon: GraduationCap,
        image: '/images/mhtcet.svg',
        href: '/prep/mhcet',
        status: 'coming-soon'
    }
];

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {exams.map((exam) => {
                        const Icon = exam.icon;

                        // Uniform Blue Theme
                        const bgIcon = exam.image ? 'bg-white' : 'bg-blue-100';
                        const textIcon = 'text-blue-600';
                        const borderHover = 'hover:border-blue-300';
                        const ringFocus = 'focus:ring-blue-500';

                        const cardClasses = `group bg-white rounded-xl border border-gray-200 transition-all overflow-hidden flex flex-row items-center p-6 relative ${
                            exam.status === 'active'
                                ? `${borderHover} hover:shadow-md cursor-pointer`
                                : 'opacity-80 hover:border-gray-300 cursor-not-allowed grayscale-[0.1]'
                        }`;

                        return (
                            <Link
                                href={exam.status === 'active' ? exam.href : '#'}
                                key={exam.id}
                                className={cardClasses}
                                onClick={(e) => exam.status !== 'active' && e.preventDefault()}
                            >
                                {/* Decorative Blur Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50/50"></div>

                                {/* Logo / Icon Container */}
                                <div className={`flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform relative z-10 p-3 ${bgIcon} ${exam.image ? 'border border-gray-100' : ''}`}>
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
                                        <Icon className={`w-8 h-8 ${textIcon}`} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow relative z-10 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{exam.title}</h3>
                                        {exam.status === 'active' && (
                                            <div className="hidden sm:flex text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 items-center text-sm font-medium whitespace-nowrap">
                                                Start <ArrowRight className="w-4 h-4 ml-1" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">{exam.subtitle}</p>

                                    {exam.status === 'active' ? (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                            Available Now
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none">
                                            Coming Soon
                                        </Badge>
                                    )}
                                </div>

                                {/* Mobile Arrow (always visible if active, since hover doesn't exist on touch as easily) */}
                                {exam.status === 'active' && (
                                     <div className="sm:hidden absolute top-6 right-6 text-blue-600">
                                        <ArrowRight className="w-5 h-5" />
                                     </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
