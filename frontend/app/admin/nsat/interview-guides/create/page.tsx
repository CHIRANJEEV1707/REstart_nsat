'use client';

import { InterviewGuideForm } from '@/components/admin/InterviewGuideForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function CreateInterviewGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/nsat/interview-guides" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Guides
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Interview Guide</h1>

                <InterviewGuideForm />
            </div>
        </div>
    );
}
