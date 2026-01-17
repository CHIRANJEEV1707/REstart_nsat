'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MockTestForm } from '@/components/admin/MockTestForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function EditMockTestPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: test, isLoading } = useQuery({
        queryKey: ['adminMockTest', id],
        queryFn: async () => {
            const res = await api.get(`/admin/nsat/mock-tests/${id}`);
            return res.data?.data;
        }
    });

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!test) return <div className="p-8">Test not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/nsat/mock-tests" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Mock Tests
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Mock Test</h1>

                <MockTestForm initialData={test} isEdit />
            </div>
        </div>
    );
}
