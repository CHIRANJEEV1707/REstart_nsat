'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Lock, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function InterviewGuideViewerPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { data: guide, isLoading } = useQuery({
        queryKey: ['interviewGuide', slug],
        queryFn: async () => {
            const res = await api.get(`/interview-guides/${slug}`);
            return res.data?.data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-12 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">Guide Not Found</h2>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const { isLimited, message, tips, sampleQuestions, content } = guide;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <Link href="/prep/nsat/interview-guide" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Guides
                    </Link>

                    <div className=" flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="capitalize">{guide.guideType} Guide</Badge>
                                {isLimited && <Badge variant="destructive">Preview Mode</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{guide.title}</h1>
                        </div>
                        {isLimited && (
                            <Link href="/prep/nsat">
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Unlock Full Guide
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Intro / Description */}
                <p className="text-gray-600 text-lg mb-8 leading-relaxed italic border-l-4 border-purple-200 pl-4 bg-purple-50/30 p-4 rounded-r-lg">
                    {guide.description}
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* Main Content */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guide Content</h2>
                            <div className="prose prose-purple max-w-none text-gray-700 whitespace-pre-wrap">
                                {content}
                            </div>

                            {isLimited && (
                                <div className="mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white text-center">
                                    <Lock className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                                    <h3 className="text-lg font-bold mb-2">Continue Reading with Premium</h3>
                                    <p className="text-gray-300 mb-6 max-w-md mx-auto">{message}</p>
                                    <Link href="/prep/nsat">
                                        <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold">
                                            Unlock Premium Access
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Sample Questions */}
                        {sampleQuestions?.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                    Sample Questions
                                </h2>
                                <div className="space-y-4">
                                    {sampleQuestions.map((q: any, idx: number) => (
                                        <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                                            <p className="font-bold text-gray-900 mb-3 text-lg">Q. {q.question}</p>
                                            <div className="bg-white rounded-lg p-4 border border-blue-100 text-gray-700 leading-relaxed">
                                                <span className="font-semibold text-blue-800 block mb-1 text-sm uppercase tracking-wide">Suggested Answer Strategy:</span>
                                                {q.suggestedAnswer}
                                            </div>
                                        </div>
                                    ))}
                                    {isLimited && (
                                        <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                            + {guide.sampleQuestions?.length > 2 ? 'More' : 'Full list of'} questions available in Premium
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Expert Tips */}
                    <div className="md:col-span-1">
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 sticky top-6">
                            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 fill-current" />
                                Expert Tips
                            </h3>
                            <ul className="space-y-4">
                                {tips?.map((tip: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 text-amber-800 text-sm leading-relaxed">
                                        <span className="font-bold text-amber-400 text-lg leading-none select-none">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                            {isLimited && (
                                <div className="mt-4 pt-4 border-t border-amber-200/50 text-center">
                                    <p className="text-xs text-amber-700 font-medium italic">Unlock premium for all tips!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
