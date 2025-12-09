"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminCollegesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['colleges-admin'],
        queryFn: async () => (await api.get('/colleges?limit=100')).data
    });

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Colleges</h1>
                <Button>Add New College</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Location</th>
                            <th className="p-4 font-medium text-gray-500">Score</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.data?.map((col: any) => (
                            <tr key={col._id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{col.name}</td>
                                <td className="p-4 text-gray-500">{col.location.city}, {col.location.state}</td>
                                <td className="p-4 text-gray-500">{col.restart_score}</td>
                                <td className="p-4">
                                    <Link href={`/admin/colleges/${col._id}`} className="text-indigo-600 font-bold hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
