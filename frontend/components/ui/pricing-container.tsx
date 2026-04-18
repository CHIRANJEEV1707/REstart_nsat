"use client"
import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface PricingPlan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number; // Kept for interface compatibility but ignored
    features: string[];
    isPopular?: boolean;
    accent: string;
    cta: string;
    href: string;
}

interface PricingProps {
    title?: string;
    plans: PricingPlan[];
    className?: string;
}

// Counter Component
const Counter = ({ from, to }: { from: number; to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const controls = animate(from, to, {
            duration: 1,
            onUpdate(value) {
                node.textContent = value.toFixed(0);
            },
        });
        return () => controls.stop();
    }, [from, to]);
    return <span ref={nodeRef} />;
};

// Header Component
const PricingHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-12 sm:mb-16 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
        >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 uppercase tracking-tight
                transition-transform hover:translate-x-1 hover:translate-y-1 mb-3">
                {title}
            </h1>
        </motion.div>
    </div>
);

// Background Effects Component (Subtle clean grid over their existing white background)
const BackgroundEffects = () => (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50" style={{
        backgroundImage: "linear-gradient(rgba(0,133,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,133,255,0.05) 1px, transparent 1px)",
        backgroundSize: "2rem 2rem"
    }} />
);

// Pricing Card Component
const PricingCard = ({
    plan,
    index
}: {
    plan: PricingPlan;
    index: number
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 20, stiffness: 100 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig);

    return (
        <motion.div
            ref={cardRef}
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
            style={{
                rotateX,
                rotateY,
                perspective: 1000,
            }}
            onMouseMove={(e) => {
                if (!cardRef.current) return;
                const rect = cardRef.current.getBoundingClientRect();
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                mouseX.set((e.clientX - centerX) / rect.width);
                mouseY.set((e.clientY - centerY) / rect.height);
            }}
            onMouseLeave={() => {
                mouseX.set(0);
                mouseY.set(0);
            }}
            className={cn(
                `relative w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 lg:p-10 border flex flex-col z-10 transition-shadow duration-300`,
                plan.isPopular 
                    ? "border-[#0085ff] shadow-[0_10px_40px_rgba(0,133,255,0.15)] ring-2 ring-[#0085ff]/20 md:-translate-y-4" 
                    : "border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,133,255,0.08)]"
            )}
        >
            {/* Popular Badge */}
            {plan.isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <motion.span
                        className="bg-[#0085ff] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/30"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Most Popular
                    </motion.span>
                </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-400 mb-2 uppercase tracking-widest">{plan.name}</h3>
                <div className="flex items-baseline gap-1 text-gray-900">
                    <span className="text-3xl font-black">₹</span>
                    <span className="text-5xl font-black">
                        <Counter from={0} to={plan.monthlyPrice} />
                    </span>
                </div>
                {plan.monthlyPrice > 0 && <p className="text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">One-Time Payment / Lifetime</p>}
                {plan.monthlyPrice === 0 && <p className="text-xs font-semibold text-[#0085ff] mt-2 uppercase tracking-wide">Completely Free</p>}
            </div>

            {/* Splitting line */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />

            {/* Features List */}
            <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                    <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex items-start gap-3 group"
                    >
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300",
                            plan.isPopular ? "bg-blue-50 text-[#0085ff]" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#0085ff]"
                        )}>
                            <svg className="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <span className="text-gray-600 font-medium text-sm leading-snug">{feature}</span>
                    </motion.div>
                ))}
            </div>

            {/* CTA Button */}
            <Link href={plan.href} className="mt-auto block z-20">
                <motion.button
                    className={cn(
                        `w-full py-3.5 rounded-full text-white font-bold text-sm tracking-wide transition-all duration-300`,
                        plan.isPopular 
                            ? "bg-[#0085ff] hover:bg-blue-600 shadow-[0_0_20px_rgba(0,133,255,0.4)] hover:shadow-[0_0_30px_rgba(0,133,255,0.6)]" 
                            : "bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {plan.cta}
                </motion.button>
            </Link>
        </motion.div>
    );
};

// Main Container Component
export const PricingContainer = ({ title = "START FREE. UPGRADE WHEN READY.", plans, className = "" }: PricingProps) => {
    return (
        <div className={cn(`w-full py-12 relative overflow-visible`, className)}>
            <PricingHeader title={title} />
            <BackgroundEffects />

            <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-center">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};
