'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// import axios from 'axios';
import api from '@/lib/axios';

import { ArrowLeft } from 'lucide-react';

interface Bundle {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    tags: string[];
    features: string[];
}

export default function PrepPage() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                // api client uses correct base URL and credentials
                const res = await api.get('/bundles');
                setBundles(res.data);
            } catch (error: any) {
                console.error("Failed to fetch bundles. Is the backend running?", error);
                // Optional: Show user-friendly error state later if needed
            } finally {
                setLoading(false);
            }
        };
        fetchBundles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
                <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-3xl mb-12">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Premium <span className="text-primary">Exam Prep</span> Bundles
                    </h1>
                    <p className="text-xl text-gray-600">
                        Structured courses, mock tests, and expert guidance to help you crack your dream college entrance exams.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bundles.map((bundle) => (
                        <div key={bundle._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {bundle.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.title}</h3>
                                <p className="text-gray-500 mb-6 flex-1">{bundle.description}</p>

                                <ul className="space-y-3 mb-8">
                                    {bundle.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                    <div>
                                        <span className="text-sm text-gray-400">Price</span>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {bundle.currency === 'INR' ? '₹' : '$'}{bundle.price}
                                        </div>
                                    </div>
                                    <Link href={`/prep/${bundle.slug}`}>
                                        <Button
                                            size="lg"
                                            className="rounded-xl bg-[#0085ff] text-white font-medium px-8 py-3 shadow-md hover:bg-[#006bd1] hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0085ff]"
                                        >
                                            View Bundle
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
