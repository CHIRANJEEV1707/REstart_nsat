'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    Globe,
    Calculator,
    Binary,
    PenTool,
    Stethoscope,
    Microscope,
    Atom,
    FlaskConical,
    Plane,
    Cpu
} from 'lucide-react';

type ExamCategory = 'engineering' | 'medical' | 'research' | 'international';

const exams = [
    // Engineering
    {
        id: 'nsat',
        title: 'NSAT',
        subtitle: 'Newton School Aptitude Test',
        icon: BookOpen,
        image: '/images/nsat-logo.svg',
        href: '/prep/nsat',
        status: 'active',
        category: 'engineering'
    },
    {
        id: 'jee-mains',
        title: 'JEE Mains',
        subtitle: 'Joint Entrance Examination Main',
        icon: Calculator,
        image: '/images/jeemains.svg',
        href: '/prep/jee-mains',
        status: 'active',
        category: 'engineering'
    },
    {
        id: 'jee-advanced',
        title: 'JEE Advanced',
        subtitle: 'Joint Entrance Examination Advanced',
        icon: Calculator,
        image: '/images/jeeadv.svg',
        href: '/prep/jee-advanced',
        status: 'active',
        category: 'engineering'
    },
    {
        id: 'bitsat',
        title: 'BITSAT',
        subtitle: 'Birla Institute Technical Test',
        icon: Binary,
        image: '/images/bitsat.svg',
        href: '/prep/bitsat',
        status: 'active',
        category: 'engineering'
    },
    {
        id: 'mhcet',
        title: 'MHCET',
        subtitle: 'Maharashtra Health & Tech CET',
        icon: GraduationCap,
        image: '/images/mhtcet.svg',
        href: '/prep/mhcet',
        status: 'coming-soon',
        category: 'engineering'
    },

    // Medical
    {
        id: 'neet',
        title: 'NEET',
        subtitle: 'National Eligibility cum Entrance Test',
        icon: Stethoscope,
        href: '/prep/neet',
        status: 'active',
        category: 'medical'
    },

    // Research
    {
        id: 'ugee',
        title: 'UGEE',
        subtitle: 'IIIT Hyderabad Undergraduate Exam',
        icon: Microscope,
        href: '/prep/ugee',
        status: 'active',
        category: 'research'
    },
    {
        id: 'iat',
        title: 'IAT',
        subtitle: 'IISER Aptitude Test',
        icon: FlaskConical,
        href: '/prep/iat',
        status: 'coming-soon',
        category: 'research'
    },
    {
        id: 'nest',
        title: 'NEST',
        subtitle: 'National Entrance Screening Test',
        icon: Atom,
        href: '/prep/nest',
        status: 'coming-soon',
        category: 'research'
    },

    // International
    {
        id: 'sat',
        title: 'SAT',
        subtitle: 'Scholastic Assessment Test',
        icon: Globe,
        href: '/prep/sat',
        status: 'coming-soon',
        category: 'international'
    },
    {
        id: 'psat',
        title: 'PSAT',
        subtitle: 'Preliminary SAT',
        icon: PenTool,
        href: '/prep/psat',
        status: 'coming-soon',
        category: 'international'
    },
];

const categories: { id: ExamCategory; label: string; icon: any }[] = [
    { id: 'engineering', label: 'Engineering', icon: Cpu },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'research', label: 'Research', icon: Microscope },
    { id: 'international', label: 'Study Abroad', icon: Plane },
];

export default function PrepHubPage() {
    const [activeTab, setActiveTab] = useState<ExamCategory>('engineering');

    const filteredExams = exams.filter(exam => exam.category === activeTab);

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 page-transition">
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Prep Hub</h1>
                    <p className="text-gray-600">Select your target pathway to find the right exams for you.</p>
                </div>

                {/* Pathway Tabs */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`
                                    flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 border
                                    ${isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Exam Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredExams.map((exam) => {
                        const Icon = exam.icon;

                        // Dynamic Theme Colors based on Category could be added, but keeping uniform blue for consistency
                        const bgIcon = exam.image ? 'bg-white' : 'bg-blue-50';
                        const textIcon = 'text-blue-600';

                        const cardClasses = `group bg-white rounded-xl border border-gray-200 transition-all overflow-hidden flex flex-row items-center p-6 relative ${
                            exam.status === 'active'
                                ? 'hover:border-blue-300 hover:shadow-md cursor-pointer'
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

                                {/* Mobile Arrow */}
                                {exam.status === 'active' && (
                                     <div className="sm:hidden absolute top-6 right-6 text-blue-600">
                                        <ArrowRight className="w-5 h-5" />
                                     </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {filteredExams.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <p className="text-gray-500">No exams found in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
