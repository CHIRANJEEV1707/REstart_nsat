"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/admin/colleges" className="block p-8 bg-white rounded-xl shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-lg">Manage Colleges</h3>
                    <p className="text-gray-500 text-sm mt-1">Add, edit, or remove colleges.</p>
                </Link>
                <Link href="/admin/exams" className="block p-8 bg-white rounded-xl shadow-sm hover:shadow-md">
                    <h3 className="font-bold text-lg">Manage Exams</h3>
                    <p className="text-gray-500 text-sm mt-1">Update exam dates and details.</p>
                </Link>
                <Link href="/admin/orders" className="block p-8 bg-white rounded-xl shadow-sm hover:shadow-md border border-yellow-100">
                    <h3 className="font-bold text-lg text-yellow-700">Pending Approvals</h3>
                    <p className="text-gray-500 text-sm mt-1">Verify manual UPI payments.</p>
                </Link>
                <Link href="/admin/nsat" className="block p-8 bg-blue-50 rounded-xl shadow-sm hover:shadow-md border border-blue-100">
                    <h3 className="font-bold text-lg text-blue-700">NSAT Prep Content</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage Mock Tests, PYQs, and Guides.</p>
                </Link>
                <Link href="/admin/claims" className="block p-8 bg-purple-50 rounded-xl shadow-sm hover:shadow-md border border-purple-100">
                    <h3 className="font-bold text-lg text-purple-700">Referral Claims</h3>
                    <p className="text-gray-500 text-sm mt-1">Approve free core pack claims.</p>
                </Link>
                <Link href="/admin/sessions" className="block p-8 bg-emerald-50 rounded-xl shadow-sm hover:shadow-md border border-emerald-100">
                    <h3 className="font-bold text-lg text-emerald-700">Session Approvals</h3>
                    <p className="text-gray-500 text-sm mt-1">Verify UPI payments for sessions.</p>
                </Link>
            </div>
        </div>
    )
}
