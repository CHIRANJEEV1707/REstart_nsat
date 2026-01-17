'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/context/AuthContext';

export default function NSATPrepPage() {
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

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
                            window.location.href = '/dashboard';
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
                <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-8 h-8 text-blue-100" />
                            <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md">NSAT Prep</Badge>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                            Master the NSAT Exam
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">
                            Comprehensive preparation materials, mock tests, and expert guidance to crack the Newton School Aptitude Test.
                        </p>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
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
                                            window.location.href = '/dashboard';
                                        } else {
                                            setSelectedPackage(pkg);
                                        }
                                    }}
                                    className={`w-full rounded-xl py-6 text-base font-semibold shadow-sm transition-all ${purchased
                                            ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                                            : (pkg.btnColor || 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300')
                                        }`}
                                >
                                    {purchased ? 'Access Content' : 'Get Started'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
