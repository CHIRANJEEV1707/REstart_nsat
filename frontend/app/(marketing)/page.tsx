import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { ReferralCard } from '@/components/ReferralCard';
import { BookOpen, ClipboardList, Users, MessageCircle, UserPlus, Trophy } from 'lucide-react';
import { PricingContainer, PricingPlan } from '@/components/ui/pricing-container';
import { ProcessPillars } from '@/components/ui/process-pillars';

// ── What's Included ────────────────────────────────────────────────────────────

function ArrowBlack() {
    return (
        <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-black/20 stroke-current overflow-visible"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20,80 Q 40,20 80,40" />
            <path d="M60,20 L80,40 L50,60" />
        </svg>
    );
}

function WhatIsIncludedSection() {
    return (
        <section id="features" className="bg-white px-6 py-20 md:px-10">
            <div className="max-w-5xl mx-auto">
                <p className="text-xs tracking-widest text-[#0085ff] font-semibold uppercase mb-3">
                    What&apos;s Included
                </p>
                <h2 className="font-black text-4xl tracking-tight text-gray-900 uppercase mb-12 leading-tight">
                    Everything you need.<br />Nothing you don&apos;t.
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                    {/* Card 1 — PYQ Bank */}
                    <div className="bg-gray-50 rounded-2xl p-8 flex flex-col relative h-64 overflow-hidden hover:bg-blue-50/40 transition-colors duration-200">
                        <h3 className="font-black uppercase tracking-tight text-gray-900 text-lg leading-tight mb-2">
                            SOLVE REAL<br />PYQ QUESTIONS
                        </h3>
                        <p className="text-xs text-black/50 font-semibold mb-auto">
                            500+ actual NSAT questions — sorted by section and difficulty
                        </p>
                        <div className="relative w-full flex justify-center mt-6">
                            <div className="flex items-stretch bg-[#0085ff] rounded-full p-1.5 shadow-lg w-full max-w-[260px]">
                                <div className="flex flex-1 items-center pl-2 pr-3 py-1 min-w-0">
                                    <div className="w-8 h-8 bg-white/20 rounded-full mr-3 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-left truncate">
                                        <p className="text-[11px] font-bold text-white leading-tight mb-0.5">PYQ Bank</p>
                                        <p className="text-[9px] text-white/80 leading-tight truncate">All Subjects</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-full px-4 flex items-center justify-center shrink-0">
                                    <span className="text-white font-black text-[11px] tracking-wide">500+ PYQs</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block absolute -right-8 bottom-8 w-14 h-14 z-30">
                            <ArrowBlack />
                        </div>
                    </div>

                    {/* Card 2 — Mock Tests */}
                    <div className="bg-gray-50 rounded-2xl p-8 flex flex-col relative h-64 overflow-hidden hover:bg-blue-50/40 transition-colors duration-200">
                        <h3 className="font-black uppercase tracking-tight text-gray-900 text-lg leading-tight mb-2">
                            TAKE FULL<br />MOCK TESTS
                        </h3>
                        <p className="text-xs text-black/50 font-semibold mb-auto">
                            22 proctored exams — General and Coding tracks with score breakdowns
                        </p>
                        <div className="relative w-full flex justify-center mt-6">
                            <div className="flex items-center bg-[#0085ff] rounded-full p-1.5 text-white shadow-lg relative z-10">
                                <div className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-full mr-2">
                                    218 / 240
                                </div>
                                <div className="font-bold text-xs px-4">
                                    Top 4%
                                </div>
                            </div>
                            <div className="absolute -bottom-3 right-[15%] bg-white text-[#0085ff] rounded-full p-2 shadow-md border border-gray-100 z-20">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current block" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="3 3 21 11 14 14 11 21 3 3" />
                                </svg>
                            </div>
                        </div>
                        <div className="hidden md:block absolute -right-8 bottom-8 w-14 h-14 z-30">
                            <ArrowBlack />
                        </div>
                    </div>

                    {/* Card 3 — Interview + Live Sessions */}
                    <div className="bg-gray-50 rounded-2xl p-8 flex flex-col relative h-64 overflow-hidden hover:bg-blue-50/40 transition-colors duration-200">
                        <h3 className="font-black uppercase tracking-tight text-gray-900 text-lg leading-tight mb-2">
                            PREP FOR THE<br />INTERVIEW
                        </h3>
                        <p className="text-xs text-black/50 font-semibold mb-auto">
                            Panel-written guides + live weekly mentor sessions on WhatsApp
                        </p>
                        <div className="flex flex-col items-start bg-[#0085ff] rounded-2xl rounded-bl-sm px-5 py-4 text-white shadow-lg mt-6 w-full max-w-[220px]">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-white/70">Next Session</p>
                            <p className="text-sm font-black mb-3">Interview Prep · 8PM</p>
                            <span className="bg-white text-[#0085ff] text-[10px] font-black rounded-full px-4 py-1.5">
                                Join Free →
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

// ── Testimonials ───────────────────────────────────────────────────────────────

interface Testimonial {
    name: string;
    context: string;
    score: string;
    quote: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Arjun S.',
        context: 'Cleared NSAT in first attempt',
        score: '210/240',
        quote: 'The mock tests were almost identical to the real exam. I attempted 3 mocks before the actual test and felt completely prepared.',
    },
    {
        name: 'Priya M.',
        context: 'Got into NST Bangalore',
        score: '198/240',
        quote: "The interview guide section is what made the difference. Most people skip interview prep — don't make that mistake.",
    },
    {
        name: 'Rohan K.',
        context: 'Scored in top 5% nationally',
        score: '220/240',
        quote: 'Solved the entire PYQ bank in 2 weeks. The subject-wise breakdown makes it so much easier to find weak areas.',
    },
];

function TestimonialsSection() {
    return (
        <section className="py-20 bg-[#0a0f1e] relative">
            {/* Background Image with low opacity */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
                style={{
                    backgroundImage: "url('/images/feedback_bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <p className="text-xs tracking-widest text-[#0085ff] font-semibold uppercase mb-4">
                    From Our Students
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white uppercase mb-14 leading-tight">
                    They prepared here.<br />They got in.
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-sm"
                        >
                            <p className="text-yellow-400 text-sm leading-none">⭐⭐⭐⭐⭐</p>
                            <p className="text-white/80 italic text-base leading-relaxed flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                                <div>
                                    <p className="font-semibold text-white text-sm">{t.name}</p>
                                    <p className="text-white/50 text-xs mt-0.5">{t.context}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-[#0085ff] text-white text-xs font-medium shrink-0 shadow-lg shadow-blue-500/20">
                                    {t.score}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── How It Works ───────────────────────────────────────────────────────────────

const steps = [
    {
        num: '01',
        Icon: UserPlus,
        title: 'Sign Up Free',
        description: 'Create your account in 30 seconds. No credit card.',
    },
    {
        num: '02',
        Icon: BookOpen,
        title: 'Practice With Real PYQs',
        description: 'Solve actual NSAT questions. Identify your weak areas fast.',
    },
    {
        num: '03',
        Icon: Trophy,
        title: 'Take A Full Mock Test',
        description: 'Simulate the real exam with proctoring. Get your score breakdown.',
    },
];

function HowItWorksSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <p className="text-xs tracking-widest text-[#0085ff] font-semibold uppercase mb-4">
                    How It Works
                </p>
                <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase mb-14 leading-tight">
                    Go from zero to<br />prepared in 3 steps.
                </h2>

                <div className="flex flex-col md:flex-row items-start gap-12">
                    {/* Left: step descriptions */}
                    <div className="flex flex-col gap-10 flex-1">
                        {steps.map((step) => (
                            <div key={step.num} className="flex gap-5 items-start">
                                <div className="w-8 h-8 rounded-full bg-[#0085ff] flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                                    {step.num}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <step.Icon className="w-5 h-5 text-[#0085ff]" />
                                    <h3 className="font-black uppercase tracking-tight text-gray-900 text-sm">{step.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: animated ProcessPillars — top-aligned with the text column */}
                    <div className="hidden md:flex flex-col items-start shrink-0 gap-3 pt-0 -mt-20">
                        <div>
                            <p className="text-xs text-[#0085ff] font-semibold uppercase tracking-widest mb-0.5">Avg. Score Progression</p>
                            <p className="text-[11px] text-gray-400">Students who complete all 3 steps score 3× higher</p>
                        </div>
                        <ProcessPillars />
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Pricing ────────────────────────────────────────────────────────────────────

const plans: PricingPlan[] = [
    {
        name: 'Free',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            '10 PYQs total',
            '1 full mock test',
            'Basic score report',
            'No card needed',
        ],
        accent: 'bg-green-500',
        cta: 'Get Started Free',
        href: '/auth/signup',
    },
    {
        name: 'Core',
        monthlyPrice: 800,
        yearlyPrice: 650,
        features: [
            'Full PYQ bank (500+)',
            'All 22 mock tests',
            'Complete interview guide',
            'Detailed analytics',
        ],
        isPopular: true,
        accent: 'bg-[#0085ff]',
        cta: 'Get Core Pack',
        href: '/checkout',
    },
    {
        name: 'Premium',
        monthlyPrice: 1499,
        yearlyPrice: 1199,
        features: [
            'Everything in Core',
            'Weekly live sessions',
            'Direct mentor access',
            'Priority support',
        ],
        accent: 'bg-indigo-600',
        cta: 'Get Premium',
        href: '/checkout',
    },
];

function PricingSection() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="w-full mx-auto px-2 md:px-6">
                <p className="text-xs tracking-widest text-[#0085ff] font-semibold uppercase mb-4 text-center relative z-20">
                    Pricing
                </p>
                <PricingContainer title="START FREE. UPGRADE WHEN READY." plans={plans} />

                <p className="text-center text-gray-400 text-sm mt-8 relative z-20">
                    🔒 Secure payment via Razorpay · Instant access · Cancel anytime
                </p>
            </div>
        </section>
    );
}

// ── Sticky Mobile CTA ──────────────────────────────────────────────────────────

function StickyBottomBanner() {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Free to start</span>
            <Link
                href="/auth/signup"
                className="bg-[#0085ff] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors"
            >
                Begin Now →
            </Link>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0f1e]">
            <Navbar />
            <Hero />

            {/* White card lifts over dark hero */}
            <div className="bg-white rounded-t-[3rem] relative z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">
                <WhatIsIncludedSection />
            </div>

            <TestimonialsSection />

            <div className="bg-white">
                <HowItWorksSection />
                <section className="pt-0 pb-16">
                    <div className="max-w-4xl mx-auto px-6">
                        <ReferralCard />
                    </div>
                </section>
                <PricingSection />
            </div>

            <Footer />
            <StickyBottomBanner />
        </div>
    );
}
