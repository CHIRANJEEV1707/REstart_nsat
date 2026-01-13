'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Receipt, ArrowRight, Download, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface PaymentSuccessProps {
    orderId?: string;
}

interface OrderDetails {
    _id: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    createdAt: string;
    bundleId: {
        title: string;
        price: number;
        currency: string;
    };
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderId }) => {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(!!orderId);
    const [error, setError] = useState('');

    useEffect(() => {
        // Confetti
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#22c55e', '#16a34a', '#4ade80'],
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#22c55e', '#16a34a', '#4ade80'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data);
            } catch (err: any) {
                console.error("Failed to fetch order", err);
                setError('Failed to load order details.');
                toast.error('Could not load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-red-500">{error}</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
            </div>
        );
    }

    // Fallback if no order data found (shouldn't happen if API works)
    const bundleName = order?.bundleId?.title || 'Bundle Purchase';
    const amount = order ? order.amount : '0.00';
    const transactionId = order?.razorpayOrderId || 'N/A';
    const date = order ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();


    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100"
            >
                <div className="bg-green-50 p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            delay: 0.2,
                            type: 'spring',
                            stiffness: 200,
                            damping: 10,
                        }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                    >
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </motion.div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-sm text-gray-500">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                <div className="space-y-4 p-8">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Receipt className="h-4 w-4 text-gray-500" />
                            Order Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bundle</span>
                                <span className="font-medium text-gray-900">{bundleName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-medium text-gray-900">₹{amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-medium text-gray-900 font-mono">{transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-900">{date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/dashboard"
                            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
                        >
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]">
                            <Download className="h-4 w-4" />
                            Download Invoice
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
