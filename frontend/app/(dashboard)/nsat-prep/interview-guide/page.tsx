'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Book, MessageCircle, Lock, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface InterviewGuide {
    _id: string;
    title: string;
    slug: string;
    guideType: 'nsat' | 'coding';
    description: string;
    isFree: boolean;
}

export default function InterviewGuideListPage() {
    const { user } = useAuth();
    const [accessLevel, setAccessLevel] = useState<'none' | 'free' | 'premium'>('none');

    // Fetch access status
    const { data: accessData } = useQuery({
        queryKey: ['freePackStatus'],
        queryFn: async () => {
            const res = await api.get('/free-pack/status');
            return res.data?.data;
        },
        enabled: !!user
    });

    useEffect(() => {
        if (accessData) {
            setAccessLevel(accessData.accessLevel);
        }
    }, [accessData]);

    const { data: guides, isLoading } = useQuery({
        queryKey: ['interviewGuides'],
        queryFn: async () => {
            const res = await api.get('/interview-guides');
            return res.data?.data || [];
        }
    });

    const guidesList: InterviewGuide[] = guides || [];

    const canAccess = (guide: InterviewGuide) => {
        if (accessLevel === 'premium') return true;
        if (accessLevel === 'free' && guide.isFree) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/nsat-prep" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to NSAT Prep
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation Guide</h1>
                    <p className="text-gray-600">Expert tips, behavioural questions, and technical concepts to help you crack the interview.</p>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guidesList.map(guide => {
                            const hasAccess = canAccess(guide);
                            return (
                                <div key={guide._id} className={`bg-white rounded-xl border p-6 transition-all group relative overflow-hidden ${hasAccess ? 'border-gray-100 hover:shadow-lg hover:border-purple-200' : 'border-gray-200 opacity-80'}`}>
                                    {guide.isFree && (
                                        <div className="absolute top-0 right-0 bg-green-100/50 text-green-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-100">
                                            FREE
                                        </div>
                                    )}
                                    {!hasAccess && (
                                        <div className="absolute top-4 right-4 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                                        {guide.guideType === 'nsat' ? <MessageCircle className="w-6 h-6" /> : <Book className="w-6 h-6" />}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{guide.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-3">{guide.description}</p>
                                    </div>

                                    {hasAccess ? (
                                        <Link href={`/nsat-prep/interview-guide/${guide.slug}`}>
                                            <Button className="w-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50">
                                                Read Guide
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/nsat-prep">
                                            <Button variant="outline" className="w-full">
                                                <Lock className="w-4 h-4 mr-2" /> Unlock
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}

                        {guidesList.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500">No interview guides available yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
