'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Users, Calendar, Star, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const CALENDLY_LINK = 'https://calendly.com/letsrevamp-here/30min';

export default function SessionsPage() {
    const [selectedType, setSelectedType] = useState<'unfiltered' | 'interview'>('unfiltered');

    return (
        <div className="min-h-screen pb-20 page-transition">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white border-0">Book a Session</Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        REstart Sessions
                    </h1>
                    <p className="text-lg text-violet-100 max-w-2xl">
                        Get real answers from real students. Book 1:1 sessions with NST seniors, current students, or mock interviews.
                    </p>
                </div>

                {/* Session Type Selector */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setSelectedType('unfiltered')}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedType === 'unfiltered'
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <MessageCircle className={`w-8 h-8 mb-3 ${selectedType === 'unfiltered' ? 'text-violet-600' : 'text-gray-400'}`} />
                        <h3 className={`text-xl font-bold mb-1 ${selectedType === 'unfiltered' ? 'text-violet-900' : 'text-gray-900'}`}>
                            REstart Unfiltered
                        </h3>
                        <p className="text-sm text-gray-500">Talk to seniors & students</p>
                        <div className="mt-4 text-2xl font-bold text-gray-900">₹200</div>
                    </button>

                    <button
                        onClick={() => setSelectedType('interview')}
                        className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedType === 'interview'
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <Calendar className={`w-8 h-8 mb-3 ${selectedType === 'interview' ? 'text-violet-600' : 'text-gray-400'}`} />
                        <h3 className={`text-xl font-bold mb-1 ${selectedType === 'interview' ? 'text-violet-900' : 'text-gray-900'}`}>
                            Mock Interview
                        </h3>
                        <p className="text-sm text-gray-500">Practice interview skills</p>
                        <div className="mt-4 text-2xl font-bold text-gray-900">₹200</div>
                    </button>
                </div>

                {/* Session Details */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
                    {selectedType === 'unfiltered' ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">REstart Unfiltered</h2>
                            <p className="text-gray-600 mb-6">
                                Get the real scoop on Newton School of Technology. Our sessions connect you with current students and seniors
                                who share unfiltered insights about campus life, curriculum, and career outcomes.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {[
                                    'Ask anything about NST - no filters',
                                    'Learn about actual placements & salary',
                                    'Understand the curriculum depth',
                                    'Get tips from successful students',
                                    'Perfect for students AND parents',
                                    'Make an informed decision',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">For Students & Parents</p>
                                        <p className="text-sm text-amber-700">Get answers about NST that aren't available on the internet.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mock Interview</h2>
                            <p className="text-gray-600 mb-6">
                                Prepare for your NSAT interview with a realistic mock session. Get feedback on your communication,
                                technical knowledge, and interview presence.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {[
                                    'Simulate real NSAT interview',
                                    'Get honest feedback',
                                    'Practice common questions',
                                    'Improve your confidence',
                                    'Learn what interviewers look for',
                                    'Personalized tips for improvement',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Book Button */}
                    <a
                        href={CALENDLY_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <Button size="lg" className="w-full h-14 text-lg bg-violet-600 hover:bg-violet-700 rounded-xl">
                            Book Your Session - ₹200
                        </Button>
                    </a>
                    <p className="text-center text-sm text-gray-400 mt-4">
                        You'll be redirected to Calendly to pick your slot. Payment collected during booking.
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
                        <div className="text-3xl font-bold text-gray-900 mb-1">30 min</div>
                        <p className="text-sm text-gray-500">Session duration</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
