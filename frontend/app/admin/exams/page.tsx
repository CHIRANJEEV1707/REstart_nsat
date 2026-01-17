"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminExamsPage() {
    const { data: exams, isLoading } = useQuery({
        queryKey: ['exams-admin'],
        queryFn: async () => (await api.get('/exams')).data.data
    });

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Exams</h1>
                <Button>Add New Exam</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Exam Name</th>
                            <th className="p-4 font-medium text-gray-500">Date</th>
                            <th className="p-4 font-medium text-gray-500">Category</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {exams?.map((exam: any) => (
                            <tr key={exam._id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{exam.name}</td>
                                <td className="p-4 text-gray-500">{new Date(exam.exam_date).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-500">{exam.category}</td>
                                <td className="p-4">
                                    <Link href={`/admin/exams/${exam._id}`} className="text-indigo-600 font-bold hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
