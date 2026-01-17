'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Lock, FileText, Calendar } from 'lucide-react';

interface PYQCategory {
    _id: string;
    title: string;
    examType: 'nsat' | 'coding-nsat';
    year: number;
    description: string;
    questionCount: number;
    isFree: boolean;
}

export default function PYQListPage() {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['pyqCategories'],
        queryFn: async () => {
            const res = await api.get('/pyqs');
            return res.data?.data || [];
        }
    });

    const categoriesList: PYQCategory[] = categories || [];

    // Group by exam type
    const generalPYQs = categoriesList.filter(c => c.examType === 'nsat');
    const codingPYQs = categoriesList.filter(c => c.examType === 'coding-nsat');

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/nsat-prep" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to NSAT Prep
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Questions</h1>
                    <p className="text-gray-600">Practice with actual questions from past years to understand the exam pattern.</p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* General NSAT */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                                NSAT General PYQs
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {generalPYQs.map(category => (
                                    <PYQCard key={category._id} category={category} />
                                ))}
                                {generalPYQs.length === 0 && (
                                    <p className="text-gray-500 col-span-full">No PYQs available yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Coding NSAT */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <code className="text-purple-600 font-mono text-lg">{`</>`}</code>
                                Coding NSAT PYQs
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {codingPYQs.map(category => (
                                    <PYQCard key={category._id} category={category} />
                                ))}
                                {codingPYQs.length === 0 && (
                                    <p className="text-gray-500 col-span-full">No Coding PYQs available yet.</p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

function PYQCard({ category }: { category: PYQCategory }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-gray-50">
                    <Calendar className="w-3 h-3 mr-1" />
                    {category.year}
                </Badge>
                {category.isFree ? (
                    <Badge className="bg-green-100 text-green-700">FREE</Badge>
                ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{category.description}</p>

            <div className="flex items-center justify-between mt-auto">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {category.questionCount} Questions
                </span>

                <Link href={`/nsat-prep/pyqs/${category._id}`}>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-auto text-sm font-medium">
                        View Questions →
                    </Button>
                </Link>
            </div>
        </div>
    );
}
