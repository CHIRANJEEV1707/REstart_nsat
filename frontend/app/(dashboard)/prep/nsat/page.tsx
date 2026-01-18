'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, TrendingUp, Sparkles, Lock, CheckCircle, Gift } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function NSATPrepPage() {
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [accessLevel, setAccessLevel] = useState<'none' | 'free' | 'premium'>('none');

    // Fetch access status
    const { data: accessData, refetch: refetchAccess } = useQuery({
        queryKey: ['freePackStatus'],
        queryFn: async () => {
            const res = await api.get('/free-pack');
            return res.data?.data;
        },
        enabled: !!user
    });

    useEffect(() => {
        if (accessData) {
            setAccessLevel(accessData.accessLevel);
        }
    }, [accessData]);

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

    const packages = [
        {
            title: "NSAT Complete Prep – Interview + Mocks",
            slug: "nsat-prep-complete",
            price: 800,
            bestFor: "Students wanting 360° coverage",
            features: [
                "Everything in Interview Prep",
                "Full-length Mock Tests",
                "Detailed Performance Analytics",
                "Personalized Weakness Analysis",
                "Priority Doubt Resolution"
            ],
            outcome: "Maximize your score and ace the interview.",
            duration: "Until exams end",
            color: "border-purple-200 bg-purple-50/50",
            btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
            btnVariant: "default"
        },
        {
            title: "NSAT Complete Prep – Interview",
            slug: "nsat-prep-interview",
            price: 500,
            popular: true,
            bestFor: "Students focusing on the interview stage",
            features: [
                "Everything in Basic Prep",
                "Exclusive Interview Preparation Modules",
                "Mock Interviews & Soft Skills",
                "Resume Review Guidance",
                "Common IIM Interview Questions"
            ],
            outcome: "Build confidence and crack the personal interview.",
            duration: "Until interview phase",
            color: "border-indigo-200 bg-indigo-50/50 ring-2 ring-indigo-500 ring-offset-2",
            btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
            btnVariant: "default"
        },
        {
            title: "NSAT Complete Prep – Basic",
            slug: "nsat-prep-basic",
            price: 300,
            bestFor: "Building strong fundamentals",
            features: [
                "All Concept Video Lectures",
                "Topic-wise Study Notes",
                "Basic Practice Questions",
                "Exam Pattern Overview",
                "Access to Community Forum"
            ],
            outcome: "Master the core concepts required for NSAT.",
            duration: "Until exams end",
            color: "border-blue-200 bg-blue-50/50",
            btnVariant: "outline"
        }
    ];

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

    const handleRazorpayPayment = async (email: string) => {
        try {
            const res = await loadRazorpay();
            if (!res) throw new Error('Razorpay SDK failed to load');

            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedPackage.price,
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
                description: `Payment for ${selectedPackage.title}`,
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
                    name: "User",
                    email: email,
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
        <div className="min-h-screen pb-20 page-transition bg-gray-50/30">
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
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl overflow-hidden relative">
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
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 mb-12 border border-orange-100 relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold uppercase tracking-wider text-sm">
                                            <Gift className="w-5 h-5" />
                                            Limited Time Offer
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Free Starter Pack</h2>
                                        <p className="text-gray-600 max-w-xl">
                                            Get instant access to <strong>1 Full-length NSAT Mock Test</strong>, <strong>1 Coding Mock Test</strong>, and <strong>Previous Year Questions</strong> - completely FREE!
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => claimMutation.mutate()}
                                        disabled={claimMutation.isPending}
                                        className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange-500/20 whitespace-nowrap min-w-[200px]"
                                    >
                                        {claimMutation.isPending ? 'Claiming...' : 'Claim Free Pack'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pricing Grid */}
                        <div className="grid md:grid-cols-3 gap-8 items-start mb-12">
                            {packages.map((pkg, idx) => {
                                const purchased = isPurchased(pkg.slug);
                                return (
                                    <div key={idx} className={`relative bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col h-full border ${pkg.popular ? pkg.color + ' shadow-xl scale-105 z-10' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'}`}>
                                        {pkg.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md tracking-wide">
                                                MOST POPULAR
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium mb-4">{pkg.bestFor}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold text-gray-900">₹{pkg.price}</span>
                                                <span className="text-gray-400 font-medium">/ bundle</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4 mb-8">
                                            <ul className="space-y-3">
                                                {pkg.features.map((feat, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-gray-700">
                                                        <div className={`mt-1 p-0.5 rounded-full ${pkg.popular ? 'bg-blue-100 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm leading-relaxed">{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 px-1 mt-auto pt-4">
                                                <span className="font-bold">Duration:</span> {pkg.duration}
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={() => {
                                                if (purchased) {
                                                    // Already purchased
                                                } else {
                                                    setSelectedPackage(pkg);
                                                }
                                            }}
                                            disabled={purchased}
                                            className={`w-full rounded-xl py-6 text-base font-semibold shadow-sm transition-all ${purchased
                                                ? 'bg-green-100 text-green-700 border-transparent cursor-default'
                                                : (pkg.btnColor || 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300')
                                                }`}
                                        >
                                            {purchased ? (
                                                <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Active</span>
                                            ) : 'Get Started'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    // Student Dashboard View
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                            <p className="text-gray-600">Track your progress and access your NSAT prep resources.</p>

                            {hasFreePack && !hasPurchasedAny && (
                                <div className="mt-4 bg-orange-50 border border-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
                                    <Gift className="w-4 h-4" />
                                    Free Starter Pack Active. Upgrade for full access.
                                </div>
                            )}
                        </div>

                        {/* Quick Access Cards */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <Link href="/prep/nsat/mock-tests" className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors relative z-10">
                                    <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Mock Tests</h3>
                                <p className="text-sm text-gray-500 relative z-10">Full-length proctored mock tests for NSAT & Coding NSAT</p>
                                <span className="inline-flex items-center text-blue-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
                                    Start Practice <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>

                            <Link href="/prep/nsat/pyqs" className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors relative z-10">
                                    <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Previous Year Questions</h3>
                                <p className="text-sm text-gray-500 relative z-10">Practice with actual questions from past NSAT exams</p>
                                <span className="inline-flex items-center text-green-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
                                    View PYQs <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>

                            <Link href="/prep/nsat/interview-guide" className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors relative z-10">
                                    <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Interview Guide</h3>
                                <p className="text-sm text-gray-500 relative z-10">Expert tips and sample questions for NSAT interview</p>
                                <span className="inline-flex items-center text-purple-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all relative z-10">
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
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Your Recent Performance
                </h2>
                <Link href="/prep/nsat/results" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
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

