'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';
import { ArrowLeft, BookOpen, Target, CheckCircle } from 'lucide-react';

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

export default function NSATPrepPage() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const res = await api.get('/bundles');
                // Filter for NSAT related bundles
                const nsatBundles = (res.data.data || []).filter((b: Bundle) =>
                    b.tags?.some(t => t.toLowerCase().includes('nsat')) ||
                    b.title.toLowerCase().includes('nsat')
                );
                setBundles(nsatBundles);
            } catch (error) {
                console.error("Failed to fetch bundles", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBundles();
    }, []);

    return (
        <div className="min-h-screen pb-20 page-transition">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white border-0">NSAT Prep</Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Master the NSAT Exam
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl">
                        Comprehensive preparation materials, mock tests, and expert guidance to crack the Newton School Aptitude Test.
                    </p>
                </div>

                {/* What You'll Get */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Covered</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Target, title: 'Aptitude', desc: 'Quantitative reasoning, logical thinking, and analytical skills' },
                            { icon: BookOpen, title: 'English', desc: 'Reading comprehension, grammar, and verbal ability' },
                            { icon: CheckCircle, title: 'Mock Tests', desc: 'Full-length practice tests with detailed solutions' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bundles */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">NSAT Prep Bundles</h2>

                {loading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : bundles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <p className="text-gray-500">No NSAT prep bundles available yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {bundles.map((bundle) => (
                            <div key={bundle._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {bundle.tags?.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.title}</h3>
                                    <p className="text-gray-500 mb-6 flex-1">{bundle.description}</p>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                        <div>
                                            <span className="text-sm text-gray-400">Price</span>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {bundle.currency === 'INR' ? '₹' : '$'}{bundle.price}
                                            </div>
                                        </div>
                                        <Link href={`/prep/${bundle.slug}`}>
                                            <Button size="lg" className="rounded-xl bg-blue-600 text-white font-medium px-8 py-3 hover:bg-blue-700">
                                                View Bundle
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
