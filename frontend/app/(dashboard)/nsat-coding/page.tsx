'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Code2, X, CreditCard, QrCode } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function NSATCodingPage() {
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | null>(null);

    const packages = [
        {
            title: "Coding NSAT Pro",
            price: 800,
            bestFor: "Top performers targeting interviews",
            features: [
                "Everything in Core Prep",
                "Advanced coding & algorithm practice",
                "Mock coding + logic interviews",
                "1:1 feedback & exam strategy",
                "Small, high-touch Pro group"
            ],
            outcome: "Exam-ready, interview-ready, zero guesswork.",
            duration: "Until exam + interview",
            color: "border-purple-200 bg-purple-50/50",
            btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
            btnVariant: "default"
        },
        {
            title: "Coding NSAT Core Prep",
            price: 500,
            popular: true,
            bestFor: "Students committed to clearing Coding NSAT",
            features: [
                "4–6 full-length Coding NSAT mocks",
                "Section-wise practice (Learnability, Pseudocode, Coding)",
                "Weekly live problem-solving sessions",
                "Doubt resolution (scheduled)",
                "Dedicated Core Prep ops group"
            ],
            outcome: "Confidently attempt all sections and maximize your normalized score.",
            duration: "Until exam ends",
            color: "border-indigo-200 bg-indigo-50/50 ring-2 ring-indigo-500 ring-offset-2",
            btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
            btnVariant: "default"
        },
        {
            title: "Coding NSAT Starter",
            price: 300,
            bestFor: "First-time test takers & beginners",
            features: [
                "1 full-length Coding NSAT mock",
                "Detailed MCQ + coding solutions",
                "Exam strategy & scoring breakdown",
                "Access to official NSAT updates"
            ],
            outcome: "Understand the exam, identify gaps, decide your prep path.",
            duration: "Until exam ends",
            color: "border-blue-200 bg-blue-50/50",
            btnVariant: "outline"
        }
    ];

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchaseClick = (pkg: any) => {
        setSelectedPackage(pkg);
        setPaymentMethod(null);
        setShowPaymentModal(true);
    };

    const handleRazorpayPayment = async () => {
        const loadingToast = toast.loading('Initializing Razorpay...');
        try {
            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load');
                return;
            }

            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedPackage.price,
                    currency: 'INR',
                    receipt: `receipt_${selectedPackage.title.replace(/\s+/g, '_')}_${Date.now()}`.substring(0, 40)
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
                handler: function (response: any) {
                    toast.dismiss(loadingToast);
                    toast.success('Payment Successful!', { icon: '🎉', duration: 5000 });
                    setShowPaymentModal(false);
                    // Verify payment on backend...
                },
                prefill: {
                    name: "User", // Placeholder
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4F46E5"
                },
                modal: {
                    ondismiss: function () {
                        toast.dismiss(loadingToast);
                        toast('Payment cancelled', { icon: '❌' });
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pb-20 page-transition bg-gray-50/30">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="w-8 h-8 text-indigo-300" />
                            <Badge className="bg-white/10 text-indigo-100 border-white/20 backdrop-blur-md">NSAT Coding</Badge>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                            Crack the Coding Round
                        </h1>
                        <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed">
                            Master Data Structures, Algorithms, and Problem Solving with our specialized preparation modules.
                        </p>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {packages.map((pkg, idx) => (
                        <div key={idx} className={`relative bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col h-full border ${pkg.popular ? pkg.color + ' shadow-xl scale-105 z-10' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'}`}>
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md tracking-wide">
                                    MOST POPULAR
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                <p className="text-sm text-gray-500 font-medium mb-4">{pkg.bestFor}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">₹{pkg.price}</span>
                                    <span className="text-gray-400 font-medium">/ package</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 mb-8">
                                <ul className="space-y-3">
                                    {pkg.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                            <div className={`mt-1 p-0.5 rounded-full ${pkg.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
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
                                onClick={() => handlePurchaseClick(pkg)}
                                className={`w-full rounded-xl py-6 text-base font-semibold shadow-sm transition-all ${pkg.btnColor || 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                Get Started
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                                <p className="text-sm text-gray-500">for {selectedPackage.title}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-8 text-center">
                                <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                                <p className="text-4xl font-extrabold text-gray-900">₹{selectedPackage.price}</p>
                            </div>

                            {!paymentMethod ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleRazorpayPayment()}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">Pay with Razorpay</p>
                                                <p className="text-xs text-gray-500">Cards, Netbanking, Wallet</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('upi')}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                <QrCode className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">Pay with UPI QR</p>
                                                <p className="text-xs text-gray-500">Scan with any UPI app</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ) : paymentMethod === 'upi' ? (
                                <div className="text-center animate-in slide-in-from-right-8 duration-200">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block mb-4 shadow-sm">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID}&pn=REstart&am=${selectedPackage.price}&cu=INR`)}`}
                                            alt="UPI QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Scan to Pay ₹{selectedPackage.price}</p>
                                    <p className="text-xs text-gray-500 mb-6">Use PhonePe, Paytm, GPay or any UPI app</p>

                                    <Button
                                        onClick={() => setPaymentMethod(null)}
                                        variant="outline"
                                        className="w-full border-gray-200"
                                    >
                                        Back to Payment Options
                                    </Button>

                                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-xs text-yellow-700 text-left">
                                        Note: After payment, please send a screenshot to support for activation.
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
