'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { GlowingShadow } from '@/components/ui/glowing-shadow';


// ── 3D text shadows ────────────────────────────────────────────────────────────

const shadow1 = '2px 2px 0 #c8e0ff, 4px 4px 0 #c8e0ff, 6px 6px 0 #c8e0ff, 8px 8px 0 #c8e0ff, 10px 10px 0 #c8e0ff, 12px 12px 0 #c8e0ff';
const shadow2 = '2px 2px 0 #a0c8ff, 4px 4px 0 #a0c8ff, 6px 6px 0 #a0c8ff, 8px 8px 0 #a0c8ff, 10px 10px 0 #a0c8ff, 12px 12px 0 #a0c8ff';

// ── Hero ───────────────────────────────────────────────────────────────────────

export default function Hero() {
    const router = useRouter();

    return (
        <section className="min-h-screen flex flex-col bg-white relative overflow-hidden z-0">

            {/* Background grid */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(0,133,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,133,255,0.10) 1px, transparent 1px)',
                    backgroundSize: '4rem 4rem',
                }}
            />

            {/* Main body */}
            <div className="flex-1 flex items-center justify-center pt-[72px] pb-28 relative z-10 px-4">
                <div className="w-full max-w-5xl mx-auto relative">

                    {/* Typography stack */}
                    <div className="flex flex-col items-stretch w-full relative z-10">

                        {/* CRACK */}
                        <p
                            className="font-black tracking-tighter leading-[0.82] uppercase text-[#0085ff] self-start pl-[8%] select-none"
                            style={{
                                fontSize: 'clamp(5rem, 14vw, 190px)',
                                textShadow: shadow1,
                            }}
                        >
                            CRACK
                        </p>

                        {/* NSAT. */}
                        <p
                            className="font-black tracking-tighter leading-[0.82] uppercase text-[#0085ff] self-center select-none"
                            style={{
                                fontSize: 'clamp(5rem, 14vw, 190px)',
                                textShadow: shadow2,
                            }}
                        >
                            NSAT.
                        </p>

                        {/* SMARTER. */}
                        <p
                            className="font-black tracking-tighter leading-[0.82] uppercase text-[#0085ff] self-end pr-[8%] select-none"
                            style={{
                                fontSize: 'clamp(5rem, 14vw, 190px)',
                                textShadow: shadow1,
                            }}
                        >
                            SMARTER.
                        </p>
                    </div>

                    {/* ── Floating card — Arjun, left of NSAT. line ── */}
                    <motion.div
                        className="hidden md:block absolute z-30"
                        style={{ top: '33%', left: '-12%' }}
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div className="relative">
                            <div
                                className="w-56 rounded-3xl p-5 rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-500 cursor-pointer scale-[0.8] lg:scale-100 origin-center"
                                style={{
                                    background: 'rgba(255,255,255,0.35)',
                                    backdropFilter: 'blur(24px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                    border: '1px solid rgba(0,133,255,0.25)',
                                    boxShadow: '0 0 0 1px rgba(0,133,255,0.1), 0 0 32px rgba(0,133,255,0.2), 0 8px 40px rgba(0,133,255,0.08)',
                                }}
                            >
                                {/* Header: avatar + name */}
                                <div className="flex items-center gap-3 mb-4">
                                    <Image
                                        src="/images/12.svg"
                                        alt="Arjun S."
                                        width={64}
                                        height={64}
                                        className="w-14 h-14 rounded-full border-2 border-white/60 object-cover shadow-md"
                                    />
                                    <div>
                                        <p className="font-bold text-sm leading-tight" style={{ color: '#0a0a0a' }}>Arjun S.</p>
                                        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#0085ff', opacity: 0.7 }}>Mock Score</p>
                                    </div>
                                </div>

                                {/* Score */}
                                <p className="text-[28px] font-black leading-none tracking-tight" style={{ color: '#0085ff' }}>
                                    218<span className="text-lg font-bold opacity-50"> / 240</span>
                                </p>

                                {/* Progress bar */}
                                <div className="rounded-full h-2 w-full mt-3" style={{ background: 'rgba(0,133,255,0.10)' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: '90%', background: 'linear-gradient(90deg, #0085ff, #00bbff)' }} />
                                </div>

                                {/* Badge */}
                                <div
                                    className="mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1"
                                    style={{ background: 'rgba(0,133,255,0.06)', border: '1px solid rgba(0,133,255,0.15)' }}
                                >
                                    <span className="text-[11px] font-semibold" style={{ color: '#0085ff' }}>Top 4% nationally</span>
                                    <span className="text-xs">🏆</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* ── Floating card — Priya, right of CRACK line ── */}
                    <motion.div
                        className="hidden md:block absolute z-30"
                        style={{ top: '10%', right: '-12%' }}
                        animate={{ y: [0, -18, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    >
                        <div className="relative">
                            <div
                                className="w-52 rounded-3xl p-5 rotate-[6deg] hover:rotate-[3deg] transition-transform duration-500 cursor-pointer scale-[0.8] lg:scale-100 origin-center"
                                style={{
                                    background: 'rgba(255,255,255,0.35)',
                                    backdropFilter: 'blur(24px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                    border: '1px solid rgba(0,133,255,0.25)',
                                    boxShadow: '0 0 0 1px rgba(0,133,255,0.1), 0 0 32px rgba(0,133,255,0.2), 0 8px 40px rgba(0,133,255,0.08)',
                                }}
                            >
                                {/* Header: avatar + name */}
                                <div className="flex items-center gap-3 mb-4">
                                    <Image
                                        src="/images/11.svg"
                                        alt="Priya M."
                                        width={64}
                                        height={64}
                                        className="w-14 h-14 rounded-full border-2 border-white/60 object-cover shadow-md"
                                    />
                                    <div>
                                        <p className="font-bold text-sm leading-tight" style={{ color: '#0a0a0a' }}>Priya M.</p>
                                        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#0085ff', opacity: 0.7 }}>This week</p>
                                    </div>
                                </div>

                                {/* Session info */}
                                <p className="font-semibold text-[15px] leading-snug" style={{ color: '#1a1a1a' }}>Interview Prep · 8PM</p>

                                {/* CTA button */}
                                <Link
                                    href="/auth/signup"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all hover:scale-105"
                                    style={{
                                        background: '#0085ff',
                                        color: '#ffffff',
                                        boxShadow: '0 2px 12px rgba(0,133,255,0.3)',
                                    }}
                                >
                                    Join Session →
                                </Link>
                            </div>

                        </div>
                    </motion.div>



                    {/* ── START FREE circle — tail of SMARTER ── */}
                    <div
                        className="hidden md:flex absolute z-40 w-32 h-32 bg-white rounded-full border-4 border-[#0085ff]/20 shadow-2xl items-center justify-center hover:scale-110 transition-transform cursor-pointer rotate-3 scale-[0.8] lg:scale-100 origin-bottom-right"
                        style={{ bottom: '0', right: '-4%' }}
                        onClick={() => router.push('/auth/signup')}
                    >
                        <div className="absolute inset-2 animate-[spin_12s_linear_infinite]">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path id="bp" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" fill="none" />
                                <text fontSize="8.5" fontWeight="900" letterSpacing="3.5" fill="#0085ff">
                                    <textPath href="#bp" startOffset="0%">START FREE • START FREE • START FREE •</textPath>
                                </text>
                            </svg>
                        </div>
                        <span className="text-[#0085ff] text-4xl font-black z-10">→</span>
                    </div>

                </div>
            </div>

            {/* ── Floating Pill Bottom Bar ── */}
            <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                <GlowingShadow>
                    {/* Left: avatars + text */}
                    <div className="flex items-center shrink-0">
                        <div className="flex items-center shrink-0">
                            {[
                                { initials: 'A', bg: '#0085ff' },
                                { initials: 'R', bg: '#00bbff' },
                                { initials: 'P', bg: '#3b82f6' },
                            ].map((s, i) => (
                                <div
                                    key={s.initials}
                                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0${i > 0 ? ' -ml-2' : ''}`}
                                    style={{ background: s.bg, zIndex: 3 - i }}
                                >
                                    {s.initials}
                                </div>
                            ))}
                        </div>
                        <span className="text-[#1a1a1a] text-sm ml-3 font-medium shrink-0 whitespace-nowrap">2,000+ students already preparing</span>
                    </div>

                    {/* Center: stats */}
                    <div className="flex items-center gap-4 shrink-0 px-4">
                        <div className="flex items-baseline gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="text-[#0085FF] font-bold tracking-tight shrink-0">22</span>
                            <span style={{ color: '#0085FF', fontSize: '11px', fontWeight: 500 }} className="shrink-0">Mock Tests</span>
                        </div>
                        <div style={{ width: '1px', height: '16px', background: 'rgba(0, 133, 255, 0.2)' }} className="shrink-0" />
                        <div className="flex items-baseline gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="text-[#0085FF] font-bold tracking-tight shrink-0">500+</span>
                            <span style={{ color: '#0085FF', fontSize: '11px', fontWeight: 500 }} className="shrink-0">PYQs</span>
                        </div>
                        <div style={{ width: '1px', height: '16px', background: 'rgba(0, 133, 255, 0.2)' }} className="shrink-0" />
                        <div className="flex items-baseline gap-1.5 shrink-0 whitespace-nowrap">
                            <span className="text-[#0085FF] font-bold tracking-tight shrink-0">Weekly</span>
                            <span style={{ color: '#0085FF', fontSize: '11px', fontWeight: 500 }} className="shrink-0">Sessions</span>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <Link
                        href="/auth/signup"
                        className="shrink-0 transition-transform hover:scale-105 whitespace-nowrap"
                        style={{
                            background: '#0085FF',
                            color: '#ffffff',
                            borderRadius: '9999px',
                            padding: '10px 22px',
                            fontWeight: 600,
                            fontSize: '14px',
                            boxShadow: '0 0 16px rgba(0, 133, 255, 0.3)'
                        }}
                    >
                        Start Free →
                    </Link>
                </GlowingShadow>
            </div>

        </section>
    );
}
