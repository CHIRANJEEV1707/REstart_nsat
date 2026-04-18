"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, Trophy } from "lucide-react";

// Total bar height in px — the gradient fill animates from 0 to fillHeight
const pillars = [
    {
        label: "Sign Up",
        score: "68",
        barHeight: 96,   // total outer bar height px
        fillHeight: 72,  // animated fill height px
        delay: 0,
        Icon: UserPlus,
    },
    {
        label: "Practice",
        score: "144",
        barHeight: 160,
        fillHeight: 132,
        delay: 0.25,
        Icon: BookOpen,
    },
    {
        label: "Succeed",
        score: "211",
        barHeight: 256,
        fillHeight: 220,
        delay: 0.5,
        Icon: Trophy,
    },
];

export const ProcessPillars = () => {
    return (
        <div className="flex items-end gap-4">
            {pillars.map((pillar, index) => (
                <div
                    key={pillar.label}
                    className="flex flex-col items-center gap-2"
                    style={{ width: 76 }}
                >
                    {/* Score above */}
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: pillar.delay + 0.7 }}
                        className="flex flex-col items-center gap-0.5"
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
                            style={{ background: 'rgba(0,133,255,0.1)', border: '1px solid rgba(0,133,255,0.2)' }}
                        >
                            <pillar.Icon className="w-3.5 h-3.5 text-[#0085ff]" />
                        </div>
                        <span className="text-[11px] text-[#0085ff] font-bold leading-none">{pillar.score}</span>
                        <span className="text-[9px] text-gray-400 leading-none">/ 240</span>
                    </motion.div>

                    {/* Bar container — fixed height, overflow hidden, gradient fills from bottom */}
                    <div
                        className="w-full rounded-xl overflow-hidden relative"
                        style={{
                            height: pillar.barHeight,
                            background: 'rgba(0,133,255,0.04)',
                            border: '1px solid rgba(0,133,255,0.15)',
                        }}
                    >
                        {/* Gradient fill — animates height from 0 */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 rounded-xl flex items-start justify-center pt-2"
                            initial={{ height: 0 }}
                            whileInView={{ height: pillar.fillHeight }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                duration: 1.0,
                                delay: pillar.delay,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            style={{
                                background: 'linear-gradient(to top, #0050bb, #0085FF, #5ab8ff)',
                            }}
                        >
                            <motion.span
                                className="text-[10px] text-white font-semibold tracking-wide"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.25, delay: pillar.delay + 0.8 }}
                            >
                                {pillar.label}
                            </motion.span>
                        </motion.div>
                    </div>

                    {/* Step number dot */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: pillar.delay + 0.9 }}
                        className="w-6 h-6 rounded-full bg-[#0085ff] flex items-center justify-center text-white font-black"
                        style={{ fontSize: 9 }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </motion.div>
                </div>
            ))}
        </div>
    );
};
