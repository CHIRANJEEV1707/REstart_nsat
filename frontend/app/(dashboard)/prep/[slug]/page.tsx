'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Script from 'next/script';

interface Bundle {
    _id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
    tags: string[];
    validityDays: number;
    hasAccess?: boolean;
}

export default function BundleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [bundle, setBundle] = useState<Bundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        const fetchBundle = async () => {
            try {
                const res = await api.get(`/bundles/${params.slug}`);
                setBundle(res.data);
            } catch (error) {
                console.error("Failed to fetch bundle", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.slug) fetchBundle();
    }, [params.slug, router]);

    const handleBuy = async () => {
        if (!user) {
            router.push('/auth/login?redirect=/prep/' + params.slug);
            return;
        }

        if (!bundle) return;

        setPurchasing(true);
        try {
            // 1. Create Order on Backend
            const { data: orderData } = await api.post(
                `/orders/create`,
                { bundleId: bundle._id }
            );

            // 2. Open Razorpay Checktout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "REstart Prep",
                description: `Payment for ${bundle.title}`,
                order_id: orderData.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await api.post(
                            `/orders/verify`,
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            }
                        );

                        if (verifyRes.data.success) {
                            toast.success('Payment Successful! Access granted.');
                            window.location.reload();
                        }
                    } catch (verifyError) {
                        console.error("Verification failed", verifyError);
                        toast.error('Payment verified failed. Contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#0085ff",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            console.error("Purchase failed", error);
            const msg = error.response?.data?.message || 'Failed to initiate purchase';
            toast.error(msg);
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading bundle details...</div>;
    if (!bundle) return <div className="p-20 text-center">Bundle not found</div>;

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="min-h-screen pt-24 pb-20 bg-gray-50/50">
                <div className="max-w-5xl mx-auto px-6">
                    <Link href="/prep" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Prep Plans
                    </Link>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

                        {/* Header Banner */}
                        <div className="bg-primary/5 p-10 md:p-16 text-center border-b border-gray-100">
                            <div className="flex justify-center gap-2 mb-6">
                                {bundle.tags.map(tag => <Badge key={tag} className="bg-white/80 backdrop-blur text-primary border-primary/20">{tag}</Badge>)}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{bundle.title}</h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{bundle.description}</p>
                        </div>

                        {/* Content & Action */}
                        <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                            {/* Features Column */}
                            <div className="md:col-span-2 p-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {bundle.features.map((feature, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Feature {i + 1}</h4>
                                                <p className="text-sm text-gray-500">{feature}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {bundle.hasAccess && (
                                    <div className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
                                        <div>
                                            <h3 className="font-bold text-green-900">You have access!</h3>
                                            <p className="text-green-700 text-sm">You have already purchased this bundle. Start learning from your dashboard.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pricing Column */}
                            <div className="p-10 bg-gray-50/30 flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">One-time Payment</p>
                                    <div className="flex items-start justify-center text-gray-900">
                                        <span className="text-2xl font-bold mt-2">{bundle.currency === 'INR' ? '₹' : '$'}</span>
                                        <span className="text-6xl font-extrabold tracking-tight">{bundle.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">Valid for {bundle.validityDays} days</p>
                                </div>

                                {bundle.hasAccess ? (
                                    <Button size="lg" className="w-full text-lg h-14 bg-green-600 hover:bg-green-700">
                                        Go to Content
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        onClick={handleBuy}
                                        disabled={purchasing}
                                        className="w-full text-lg h-14 shadow-xl shadow-primary/20"
                                    >
                                        {purchasing ? 'Processing...' : 'Buy Bundle Now'}
                                    </Button>
                                )}

                                <p className="text-center text-xs text-gray-400 mt-6">
                                    Secure payment via Razorpay. <br /> 30-day money-back guarantee.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
