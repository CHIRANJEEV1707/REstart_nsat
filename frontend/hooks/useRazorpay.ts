import { useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface RazorpayOptions {
    key: string;
    amount: string;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => { open: () => void };
    }
}

export const useRazorpay = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const processPayment = async (bundleId: string, user: { name: string; email: string }) => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: orderData } = await api.post('/orders/create', { bundleId });

            // 2. Load Razorpay Script (if not already loaded)
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => script.onload = resolve);
            }

            // 3. Open Razorpay
            const options: RazorpayOptions = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Let's Restart",
                description: "Bundle Purchase",
                order_id: orderData.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        // 4. Verify Payment
                        const verifyRes = await api.post('/orders/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        if (verifyRes.data.success) {
                            router.push(`/checkout/success?orderId=${orderData.orderId}`);
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error('Payment verification failed');
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

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error("Payment failed", error);
            toast.error(error.response?.data?.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return { processPayment, loading };
};
