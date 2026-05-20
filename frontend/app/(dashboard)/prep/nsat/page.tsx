'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, TrendingUp, Sparkles, Lock, CheckCircle, Gift, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ReferralCard } from '@/components/ReferralCard';

export default function NSATPrepPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Fetch access status
    const { data: accessData, refetch: refetchAccess, isLoading: queryLoading } = useQuery({
        queryKey: ['freePackStatus'],
        queryFn: async () => {
            const res = await api.get('/free-pack');
            return res.data?.data;
        },
        enabled: !!user
    });

    const accessLevel = accessData?.accessLevel || 'none';
    const hasPurchasedAny = accessLevel === 'premium';
    const hasFreePack = accessLevel === 'free';
    const showDashboard = hasPurchasedAny || hasFreePack;

    const claimMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/free-pack', { source: 'nsat-prep-page' });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.alreadyClaimed) {
                toast.success('You already have the free pack!');
            } else {
                toast.success('🎉 Free pack claimed successfully!');
            }
            refetchAccess();
        },
        onError: () => {
            toast.error('Failed to claim free pack. Please try again.');
        }
    });

    if (authLoading || queryLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#0085ff] animate-spin" />
            </div>
        );
    }

    // Helper to check if purchased
    const isPurchased = (slug: string) => {
        return user?.purchasedBundles?.some((b: any) => b.productSlug === slug);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (discountedPrice?: number) => {
        const priceToCharge = discountedPrice ?? selectedPackage.price;

        try {
            const res = await loadRazorpay();
            if (!res) throw new Error('Razorpay SDK failed to load');

            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: priceToCharge,
                    currency: 'INR',
                    productSlug: selectedPackage.slug,
                    receipt: `receipt_${selectedPackage.slug}_${Date.now()}`.substring(0, 40)
                })
            });

            if (!orderRes.ok) throw new Error('Failed to create order');
            const orderData = await orderRes.json();

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "REstart",
                description: discountedPrice ? `Payment for ${selectedPackage.title} (50% OFF)` : `Payment for ${selectedPackage.title}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success('Payment Verified! Access Granted.');
                            window.location.reload();
                        } else {
                            toast.error('Verification failed: ' + verifyData.message);
                        }
                    } catch (e) {
                        console.error("Verification error", e);
                        toast.error('Payment verification failed');
                    }
                    setSelectedPackage(null);
                },
                prefill: {
                    name: user?.name || "User",
                    email: user?.email || "",
                    contact: "9999999999"
                },
                theme: { color: "#2563EB" }
            };
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (e) {
            console.error(e);
            toast.error('Payment initialization failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pb-20 page-transition">
            <Toaster position="top-right" />

            <PaymentModal
                isOpen={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
                pkg={selectedPackage || { title: '', price: 0, slug: '' }}
                upiId={process.env.NEXT_PUBLIC_UPI_ID || ''}
                onRazorpay={handleRazorpayPayment}
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">


                    {showDashboard && (
                        <div className="flex gap-2">
                            <Button
                                variant={showUpgrade ? "default" : "outline"}
                                onClick={() => setShowUpgrade(!showUpgrade)}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                {showUpgrade ? "View Dashboard" : "Upgrade / Store"}
                            </Button>
                        </div>
                    )}
                </div>

                {!showDashboard || showUpgrade ? (
                    // Marketing / Sales View
                    <>
                        {/* Hero Section */}
                        <div className="rounded-3xl p-8 md:p-12 text-white mb-12 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0085ff 0%, #0060cc 100%)', boxShadow: '0 8px 40px rgba(0,133,255,0.25)' }}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <BookOpen className="w-8 h-8 text-blue-100" />
                                    <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md">NSAT Prep</Badge>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                                    {hasPurchasedAny ? "Upgrade Your Prep" : "Master the NSAT Exam"}
                                </h1>
                                <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
                                    {hasPurchasedAny
                                        ? "Unlock more features, full-length mocks, and expert interview guidance to secure your admission."
                                        : "Comprehensive preparation materials, mock tests, and expert guidance to crack the Newton School Aptitude Test."}
                                </p>
                            </div>
                        </div>

                        {/* Free Pack Offer */}
                        {!hasFreePack && !hasPurchasedAny && (
                            <div className="rounded-2xl p-8 mb-12 relative overflow-hidden" style={{ background: 'rgba(0,133,255,0.04)', border: '1px solid rgba(0,133,255,0.18)' }}>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-sm text-[#0085ff]">
                                            <Gift className="w-5 h-5" />
                                            Limited Time Offer
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Free Starter Pack</h2>
                                        <p className="text-gray-600 max-w-xl">
                                            Get instant access to <strong>4 Full-length General Mock Tests</strong> and <strong>4 Coding Mock Tests</strong> — completely FREE!
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => claimMutation.mutate()}
                                        disabled={claimMutation.isPending}
                                        className="text-white border-0 whitespace-nowrap min-w-[200px]"
                                        style={{ background: '#0085ff', boxShadow: '0 4px 16px rgba(0,133,255,0.25)' }}
                                    >
                                        {claimMutation.isPending ? 'Claiming...' : 'Claim Free Pack'}
                                    </Button>
                                </div>
                            </div>
                        )}



                        {/* Pricing Cards — Free vs Premium */}
                        <div className="grid md:grid-cols-2 gap-8 items-start max-w-3xl mx-auto mb-12">
                            {/* Free Card */}
                            <div className="relative bg-white rounded-3xl p-8 flex flex-col h-full hover:shadow-lg transition-all duration-300" style={{ border: '1px solid rgba(0,133,255,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-green-100 text-green-700">
                                        <Gift className="w-3.5 h-3.5" /> FREE
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Starter Pack</h3>
                                    <p className="text-sm text-gray-500 mb-4">Begin your NSAT journey</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-gray-900">₹0</span>
                                        <span className="text-gray-400 font-medium">/ forever</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 flex-1 mb-8">
                                    {[
                                        '4 Full-length General Mock Tests',
                                        '4 Full-length Coding Mock Tests',
                                        'Detailed solutions & analytics',
                                        'Performance tracking dashboard',
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                            <div className="mt-1 p-0.5 rounded-full text-[#0085ff]" style={{ background: 'rgba(0,133,255,0.08)' }}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm leading-relaxed">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    size="lg"
                                    onClick={() => !hasFreePack && claimMutation.mutate()}
                                    disabled={hasFreePack || claimMutation.isPending}
                                    className={`w-full rounded-xl py-6 text-base font-semibold transition-all ${hasFreePack ? 'bg-green-100 text-green-700 cursor-default' : 'bg-white text-[#0085ff] hover:bg-[rgba(0,133,255,0.06)]'}`}
                                    style={!hasFreePack ? { border: '1.5px solid #0085ff' } : undefined}
                                >
                                    {hasFreePack ? (
                                        <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Active</span>
                                    ) : claimMutation.isPending ? 'Claiming...' : 'Claim Free Pack'}
                                </Button>
                            </div>

                            {/* Premium Card */}
                            <div className="relative bg-white rounded-3xl p-8 flex flex-col h-full shadow-xl scale-[1.02]" style={{ border: '2px solid #0085ff', boxShadow: '0 8px 40px rgba(0,133,255,0.18)' }}>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md tracking-wide" style={{ background: '#0085ff' }}>
                                    MOST POPULAR
                                </div>
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(0,133,255,0.08)', color: '#0085ff' }}>
                                        <Sparkles className="w-3.5 h-3.5" /> PREMIUM
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Premium Pack</h3>
                                    <p className="text-sm text-gray-500 mb-4">Complete NSAT mastery</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-gray-900">₹800</span>
                                        <span className="text-gray-400 font-medium">/ lifetime</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 flex-1 mb-8">
                                    {[
                                        'All 10 General + 10 Coding Mock Tests',
                                        'Full PYQ library',
                                        'VIP WhatsApp community',
                                        'Interview prep priority support',
                                        'Lifetime access',
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                            <div className="mt-1 p-0.5 rounded-full text-[#0085ff]" style={{ background: 'rgba(0,133,255,0.08)' }}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm leading-relaxed">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    size="lg"
                                    onClick={() => !hasPurchasedAny && setSelectedPackage({ title: 'NSAT Premium Pack', slug: 'nsat-premium', price: 800 })}
                                    disabled={hasPurchasedAny}
                                    className={`w-full rounded-xl py-6 text-base font-semibold transition-all ${hasPurchasedAny ? 'bg-green-100 text-green-700 cursor-default' : 'text-white'}`}
                                    style={!hasPurchasedAny ? { background: '#0085ff', boxShadow: '0 4px 16px rgba(0,133,255,0.30)' } : undefined}
                                    onMouseEnter={e => !hasPurchasedAny && (e.currentTarget.style.background = '#0070d9')}
                                    onMouseLeave={e => !hasPurchasedAny && (e.currentTarget.style.background = '#0085ff')}
                                >
                                    {hasPurchasedAny ? (
                                        <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Active</span>
                                    ) : 'Get Premium — ₹800'}
                                </Button>
                            </div>
                        </div>

                        {/* Referral Card (Bottom) */}
                        {!isPurchased('nsat-premium') && <ReferralCard />}
                    </>
                ) : (
                    // Student Dashboard View
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                            <p className="text-gray-600">Track your progress and access your NSAT prep resources.</p>

                            {hasFreePack && !hasPurchasedAny && (
                                <div className="mt-4 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 text-[#0085ff]" style={{ background: 'rgba(0,133,255,0.06)', border: '1px solid rgba(0,133,255,0.18)' }}>
                                    <Gift className="w-4 h-4" />
                                    Free Starter Pack Active. Upgrade for full access.
                                </div>
                            )}
                        </div>

                        {/* Quick Access Cards */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <Link href="/prep/nsat/mock-tests" className="group bg-white rounded-2xl p-6 transition-all relative overflow-hidden" style={{ border: '1px solid rgba(0,133,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,133,255,0.08)' }}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" style={{ background: 'rgba(0,133,255,0.06)' }}></div>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors relative z-10" style={{ background: 'rgba(0,133,255,0.08)' }}>
                                    <svg className="w-6 h-6 text-[#0085ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Mock Tests</h3>
                                <p className="text-sm text-gray-500 relative z-10">Full-length proctored mock tests for NSAT & Coding NSAT</p>
                                <span className="inline-flex items-center text-[#0085ff] text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
                                    Start Practice <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>

                            <Link href="/prep/nsat/pyq" className="group bg-white rounded-2xl p-6 transition-all relative overflow-hidden" style={{ border: '1px solid rgba(0,133,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,133,255,0.08)' }}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" style={{ background: 'rgba(0,133,255,0.06)' }}></div>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors relative z-10" style={{ background: 'rgba(0,133,255,0.08)' }}>
                                    <svg className="w-6 h-6 text-[#0085ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Previous Year Questions</h3>
                                <p className="text-sm text-gray-500 relative z-10">Practice with actual questions from past NSAT exams</p>
                                <span className="inline-flex items-center text-[#0085ff] text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
                                    View PYQs <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>

                            <Link href="/prep/nsat/interview-guide" className="group bg-white rounded-2xl p-6 transition-all relative overflow-hidden" style={{ border: '1px solid rgba(0,133,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 28px rgba(0,133,255,0.08)' }}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" style={{ background: 'rgba(0,133,255,0.06)' }}></div>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors relative z-10" style={{ background: 'rgba(0,133,255,0.08)' }}>
                                    <svg className="w-6 h-6 text-[#0085ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Interview Guide</h3>
                                <p className="text-sm text-gray-500 relative z-10">Expert tips and sample questions for NSAT interview</p>
                                <span className="inline-flex items-center text-[#0085ff] text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
                                    Read Guide <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>
                        </div>

                        {/* Recent Performance Section */}
                        <RecentPerformance />
                    </>
                )}
            </div>
        </div>
    );
}

// Sub-component for Performance
function RecentPerformance() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mock-tests/attempts')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAttempts(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;
    if (attempts.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-8 mb-12" style={{ border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#0085ff]" />
                    Your Recent Performance
                </h2>
                <Link href="/prep/nsat/results" className="text-sm font-medium text-[#0085ff] hover:underline">
                    View All Results
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-gray-100">
                            <th className="pb-4 font-semibold text-gray-500 text-sm">Test Name</th>
                            <th className="pb-4 font-semibold text-gray-500 text-sm">Date</th>
                            <th className="pb-4 font-semibold text-gray-500 text-sm">Score</th>
                            <th className="pb-4 font-semibold text-gray-500 text-sm">Accuracy</th>
                            <th className="pb-4 font-semibold text-gray-500 text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {attempts.map((attempt) => (
                            <tr key={attempt._id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-medium text-gray-900">{attempt.mockTestId?.title || 'Unknown Test'}</td>
                                <td className="py-4 text-gray-500">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                                <td className="py-4 text-gray-900">
                                    <span className="font-bold text-blue-600">{attempt.totalScore}</span>
                                    <span className="text-gray-400 text-xs"> / {attempt.mockTestId?.totalMarks || 100}</span>
                                </td>
                                <td className="py-4">
                                    <Badge variant="outline" className={`${(attempt.analytics?.accuracy || 0) > 80 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                        {Math.round(attempt.analytics?.accuracy || 0)}%
                                    </Badge>
                                </td>
                                <td className="py-4">
                                    <Link href={`/prep/nsat/mock-tests/results/${attempt._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                                        View Analysis
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

