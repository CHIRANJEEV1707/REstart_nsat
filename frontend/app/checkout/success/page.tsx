import React, { Suspense } from 'react';
import PaymentSuccess from '@/components/checkout/PaymentSuccess';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Confirmed | LetsRestart',
    description: 'Thank you for your purchase. Your order has been confirmed.',
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;

    const orderId = typeof resolvedParams.orderId === 'string' ? resolvedParams.orderId : undefined;

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PaymentSuccess orderId={orderId} />
        </Suspense>
    );
}
