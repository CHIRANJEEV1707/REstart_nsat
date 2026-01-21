'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Users, Calendar, Star, CheckCircle, Video, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { toast, Toaster } from 'sonner';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const SESSION_CONFIG = {
    'interview-prep': {
        title: 'Interview Prep',
        price: 100,
        duration: '1 hour',
        description: 'Ace your NSAT interview with expert guidance.',
        features: [
            'Simulate real NSAT interview',
            'Get honest feedback',
            'Practice common questions',
            'Improve your confidence',
            'Learn what interviewers look for',
            'Personalized tips for improvement',
        ],
        icon: Calendar,
        color: 'blue'
    },
    'restart-unfiltered': {
        title: 'REstart Unfiltered',
        price: 200,
        duration: '1 hour',
        description: 'Get the real scoop on Newton School of Technology from current students and seniors.',
        features: [
            'Ask anything about NST - no filters',
            'Learn about actual placements & salary',
            'Understand the curriculum depth',
            'Get tips from successful students',
            'Perfect for students AND parents',
            'Make an informed decision',
        ],
        icon: MessageCircle,
        color: 'sky'
    }
};

type SessionType = 'interview-prep' | 'restart-unfiltered';

export default function SessionsPage() {
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState<SessionType>('restart-unfiltered');
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const selectedSession = SESSION_CONFIG[selectedType];

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);

        try {
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Failed to load payment gateway');
                setLoading(false);
                return;
            }

            // Create order
            const orderRes = await api.post('/sessions/create-order', {
                sessionType: selectedType
            });

            if (!orderRes.data.success) {
                toast.error(orderRes.data.message || 'Failed to create order');
                setLoading(false);
                return;
            }

            const { orderId, amount, keyId } = orderRes.data.data;

            // Initialize Razorpay
            const options = {
                key: keyId,
                amount,
                currency: 'INR',
                name: 'REstart',
                description: selectedSession.title,
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        const verifyRes = await api.post('/sessions/verify-payment', {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            toast.success('Payment successful! Redirecting to schedule...');
                            setShowPaymentModal(false);
                            // Redirect to Calendly
                            setTimeout(() => {
                                window.open(verifyRes.data.data.calendlyUrl, '_blank');
                            }, 1500);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        toast.error('Failed to verify payment');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: ''
                },
                theme: {
                    color: '#0085ff'
                },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate booking');
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        if (!user) {
            toast.error('Please login to book a session');
            return;
        }
        setShowPaymentModal(true);
    };

    return (
        <div className="min-h-screen pb-20 page-transition">
            <Toaster position="top-right" />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                pkg={{
                    title: selectedSession.title,
                    price: selectedSession.price,
                    slug: selectedType
                } as any}
                upiId={process.env.NEXT_PUBLIC_UPI_ID || ''}
                onRazorpay={handleRazorpayPayment}
                upiSubmitUrl="/api/sessions/upi-submit"
            />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-sky-700 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl shadow-blue-500/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white border-0">1-on-1 Sessions</Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Book a Session
                    </h1>
                    <p className="text-lg text-blue-50 max-w-2xl">
                        Get personalized guidance from our team. Choose between interview prep or an unfiltered chat about NST.
                    </p>
                </div>

                {/* Session Type Selector */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setSelectedType('restart-unfiltered')}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedType === 'restart-unfiltered'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <MessageCircle className={`w-8 h-8 mb-3 ${selectedType === 'restart-unfiltered' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <h3 className={`text-xl font-bold mb-1 ${selectedType === 'restart-unfiltered' ? 'text-blue-900' : 'text-gray-900'}`}>
                            REstart Unfiltered
                        </h3>
                        <p className="text-sm text-gray-500">Talk to seniors & students</p>
                        <div className="mt-4 text-2xl font-bold text-gray-900">₹200</div>
                    </button>

                    <button
                        onClick={() => setSelectedType('interview-prep')}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedType === 'interview-prep'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <Calendar className={`w-8 h-8 mb-3 ${selectedType === 'interview-prep' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <h3 className={`text-xl font-bold mb-1 ${selectedType === 'interview-prep' ? 'text-blue-900' : 'text-gray-900'}`}>
                            Interview Prep
                        </h3>
                        <p className="text-sm text-gray-500">Mock NSAT interview</p>
                        <div className="mt-4 text-2xl font-bold text-gray-900">₹100</div>
                    </button>
                </div>

                {/* Session Details */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h2>
                        <Badge variant="outline" className="text-gray-500">
                            <Clock className="w-3 h-3 mr-1" /> {selectedSession.duration}
                        </Badge>
                    </div>
                    <p className="text-gray-600 mb-6">{selectedSession.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        {selectedSession.features.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-gray-700">{item}</span>
                            </div>
                        ))}
                    </div>

                    {selectedType === 'restart-unfiltered' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
                            <div className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800">For Students & Parents</p>
                                    <p className="text-sm text-amber-700">Get answers about NST that aren&apos;t available on the internet.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Book Button */}
                    <Button
                        size="lg"
                        onClick={handleBookNow}
                        disabled={loading}
                        className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : `Book Now - ₹${selectedSession.price}`}
                    </Button>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        Pay securely via Razorpay or UPI QR. After payment, you&apos;ll be redirected to pick your slot.
                    </p>
                </div>

                {/* Trust Signals */}
                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="text-3xl font-bold text-gray-900 mb-1">100+</div>
                        <p className="text-sm text-gray-500">Sessions completed</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                        <p className="text-sm text-gray-500">Average rating</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="text-3xl font-bold text-gray-900 mb-1">1 hour</div>
                        <p className="text-sm text-gray-500">Session duration</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
