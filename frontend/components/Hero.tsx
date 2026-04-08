'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';


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
                                <Image
                                    src="https://i.pravatar.cc/48?img=11"
                                    alt="Arjun S."
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full border-2 border-white/40"
                                />
                                <p className="font-bold text-sm mt-2" style={{ color: '#0085ff' }}>Arjun S.</p>
                                <p className="text-xs" style={{ color: '#0085ff', opacity: 0.6 }}>Mock Score</p>
                                <p className="text-3xl font-black mt-1" style={{ color: '#0085ff' }}>218 / 240</p>
                                <div className="rounded-full h-1.5 w-full mt-2" style={{ background: 'rgba(0,133,255,0.15)' }}>
                                    <div className="h-full rounded-full" style={{ width: '90%', background: '#0085ff' }} />
                                </div>
                                <p className="text-xs mt-2" style={{ color: '#1a1a1a' }}>Top 4% nationally 🏆</p>
                            </div>

                        </div>
                    </motion.div>

                    {/* ── Floating card — Priya, right of CRACK line ── */}
                    <motion.div
                        className="hidden md:block absolute z-30"
                        style={{ top: '-4%', right: '-12%' }}
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
                                <Image
                                    src="https://i.pravatar.cc/48?img=5"
                                    alt="Priya M."
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full border-2 border-white/40"
                                />
                                <p className="font-bold text-sm mt-2" style={{ color: '#0085ff' }}>Priya M.</p>
                                <p className="text-xs" style={{ color: '#0085ff', opacity: 0.6 }}>This week</p>
                                <p className="font-semibold text-base mt-1" style={{ color: '#1a1a1a' }}>Interview Prep · 8PM</p>
                                <Link
                                    href="/auth/signup"
                                    className="mt-3 inline-block rounded-full px-4 py-1.5 text-xs font-bold transition-colors"
                                    style={{
                                        background: 'rgba(0,133,255,0.08)',
                                        border: '1px solid rgba(0,133,255,0.3)',
                                        color: '#0085ff',
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

            {/* ── Bottom strip ── */}
            <div className="absolute bottom-0 w-full bg-[#0085ff] border-t border-[#0060cc] py-5 px-8 z-40">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">

                    {/* Avatars + count */}
                    <div className="flex items-center">
                        <div className="flex items-center">
                            {[1, 2, 3].map((n, i) => (
                                <Image
                                    key={n}
                                    src={`https://i.pravatar.cc/32?img=${n}`}
                                    alt={`Student ${n}`}
                                    width={32}
                                    height={32}
                                    className={`w-8 h-8 rounded-full border-2 border-white object-cover${i > 0 ? ' -ml-2' : ''}`}
                                />
                            ))}
                        </div>
                        <span className="text-white text-sm ml-3">2,000+ students already preparing</span>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center">
                        {['22 Mock Tests', '500+ PYQs', 'Weekly Sessions'].map((stat, i) => (
                            <span
                                key={stat}
                                className={`text-white text-xs px-4${i > 0 ? ' border-l border-white/30' : ''}`}
                            >
                                {stat}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        href="/auth/signup"
                        className="bg-white text-[#0085ff] rounded-full px-6 py-2.5 text-sm font-bold hover:bg-blue-50 transition-colors shrink-0"
                    >
                        Start Free →
                    </Link>
                </div>
            </div>

        </section>
    );
}
