'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { InterviewGuideForm } from '@/components/admin/InterviewGuideForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function EditInterviewGuidePage() {
    const params = useParams();
    const id = params.id as string;

    const { data: guide, isLoading } = useQuery({
        queryKey: ['adminInterviewGuide', id],
        queryFn: async () => (await api.get(`/admin/nsat/interview-guides/${id}`)).data.data
    });

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!guide) return <div className="p-8">Guide not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/nsat/interview-guides" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Guides
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Interview Guide</h1>

                <InterviewGuideForm initialData={guide} isEdit />
            </div>
        </div>
    );
}
