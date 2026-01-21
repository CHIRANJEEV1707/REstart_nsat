'use client';

import { useState } from 'react';
import { Check, Crown, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Bundle {
    id: string;
    title: string;
    tier: 'basic' | 'core' | 'premium';
    price: number;
    originalPrice?: number;
    tagline: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
    whatsappLink?: string;
}

const bundles: Bundle[] = [
    {
        id: 'nsat-basic',
        title: 'Basic',
        tier: 'basic',
        price: 300,
        tagline: 'Start Your NSAT Prep',
        features: [
            '3 Full Mock Tests',
            '3 Real PYQ Papers',
            'Interview Question Bank',
            'Detailed Solutions'
        ]
    },
    {
        id: 'nsat-core',
        title: 'Core',
        tier: 'core',
        price: 500,
        originalPrice: 700,
        tagline: 'Serious About Success?',
        highlighted: true,
        badge: 'Most Popular',
        features: [
            '5 Mock Tests (General + Coding)',
            '5 PYQ Papers',
            'Exclusive WhatsApp Community',
            'Direct Interview Coordination',
            'Priority Support'
        ],
        whatsappLink: 'https://chat.whatsapp.com/Dv5cSSZUPeC7egTbJ43fwF'
    },
    {
        id: 'nsat-premium',
        title: 'Premium',
        tier: 'premium',
        price: 800,
        originalPrice: 1200,
        tagline: 'Maximum Preparation',
        badge: 'Best Value',
        features: [
            'All 20 Mock Tests',
            'All PYQ Papers',
            'VIP WhatsApp Group',
            'Priority Interview Scheduling',
            '1-on-1 Doubt Support',
            'Lifetime Access'
        ],
        whatsappLink: 'https://chat.whatsapp.com/FSGst6uURfRDCjUwPe8kof'
    }
];

interface BundlePricingCardsProps {
    onSelectBundle: (bundleId: string, tier: string) => void;
    userBundle?: string | null;
}

export default function BundlePricingCards({ onSelectBundle, userBundle }: BundlePricingCardsProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelect = async (bundle: Bundle) => {
        setLoading(bundle.id);
        try {
            await onSelectBundle(bundle.id, bundle.tier);
        } finally {
            setLoading(null);
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'basic': return <Zap className="w-5 h-5" />;
            case 'core': return <Rocket className="w-5 h-5" />;
            case 'premium': return <Crown className="w-5 h-5" />;
            default: return null;
        }
    };

    const hasBundle = (tier: string) => {
        if (!userBundle) return false;
        const tierOrder = ['basic', 'core', 'premium'];
        return tierOrder.indexOf(userBundle) >= tierOrder.indexOf(tier);
    };

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Your Full Potential</h2>
                <p className="text-gray-600">Choose the plan that fits your preparation needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {bundles.map((bundle) => {
                    const isOwned = hasBundle(bundle.tier);
                    const isHighlighted = bundle.highlighted;

                    return (
                        <div
                            key={bundle.id}
                            className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${isHighlighted
                                    ? 'border-indigo-500 shadow-xl shadow-indigo-100 scale-105 bg-gradient-to-b from-indigo-50/50 to-white'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                                }`}
                        >
                            {/* Badge */}
                            {bundle.badge && (
                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${isHighlighted ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                    {bundle.badge}
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${isHighlighted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getTierIcon(bundle.tier)}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{bundle.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{bundle.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2">
                                    {bundle.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">₹{bundle.originalPrice}</span>
                                    )}
                                    <span className="text-4xl font-bold text-gray-900">₹{bundle.price}</span>
                                </div>
                                {bundle.originalPrice && (
                                    <span className="text-sm text-green-600 font-medium">
                                        Save ₹{bundle.originalPrice - bundle.price}
                                    </span>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                                {bundle.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isHighlighted ? 'text-indigo-600' : 'text-green-500'
                                            }`} />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            {isOwned ? (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    disabled
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Unlocked
                                </Button>
                            ) : (
                                <Button
                                    variant={isHighlighted ? 'default' : 'outline'}
                                    className={`w-full ${isHighlighted ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                    onClick={() => handleSelect(bundle)}
                                    disabled={loading === bundle.id}
                                >
                                    {loading === bundle.id ? 'Processing...' : `Get ${bundle.title}`}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
