'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, HelpCircle, Book, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NSATAdminPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Admin Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">NSAT Prep Management</h1>
            <p className="text-gray-500 mb-8">Create and manage content for the NSAT preparation module.</p>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Mock Tests */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Mock Tests</h3>
                    <p className="text-sm text-gray-500 mb-6">Create new tests, manage questions, and view test analytics.</p>
                    <Link href="/admin/nsat/mock-tests">
                        <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-0">Manage Tests</Button>
                    </Link>
                </div>

                {/* PYQs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Previous Year Questions</h3>
                    <p className="text-sm text-gray-500 mb-6">Organize PYQ categories and upload year-wise questions.</p>
                    <Link href="/admin/nsat/pyqs">
                        <Button className="w-full bg-green-50 text-green-600 hover:bg-green-100 border-0">Manage PYQs</Button>
                    </Link>
                </div>

                {/* Interview Guides */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                        <Book className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Interview Guides</h3>
                    <p className="text-sm text-gray-500 mb-6">Write and edit interview preparation content and tips.</p>
                    <Link href="/admin/nsat/interview-guides">
                        <Button className="w-full bg-purple-50 text-purple-600 hover:bg-purple-100 border-0">Manage Guides</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
