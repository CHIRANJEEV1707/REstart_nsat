'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, FileText, ArrowLeft, MoreHorizontal } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminMockTestsPage() {
    const queryClient = useQueryClient();

    const { data: tests, isLoading } = useQuery({
        queryKey: ['adminMockTests'],
        queryFn: async () => {
            const res = await api.get('/admin/nsat/mock-tests');
            return res.data?.data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/nsat/mock-tests/${id}`);
        },
        onSuccess: () => {
            toast.success('Test deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['adminMockTests'] });
        },
        onError: () => {
            toast.error('Failed to delete test');
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <Link href="/admin/nsat" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to NSAT Admin
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Mock Tests</h1>
                        <p className="text-gray-500">Create, edit, and configure mock tests.</p>
                    </div>
                    <Link href="/admin/nsat/mock-tests/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Test
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />)}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tests?.map((test: any) => (
                                    <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{test.title}</p>
                                            <p className="text-xs text-gray-400 font-mono">{test.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize">{test.examType === 'nsat' ? 'General' : 'Coding'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {test.duration} mins
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {test.isFree && <Badge className="bg-green-100 text-green-700">Free</Badge>}
                                                {test.isPremium && <Badge className="bg-purple-100 text-purple-700">Premium</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/nsat/mock-tests/${test._id}/questions`}>
                                                    <Button variant="outline" size="sm" className="h-8">
                                                        <FileText className="w-3 h-3 mr-2" />
                                                        Questions
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/nsat/mock-tests/${test._id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Edit className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (confirm('Are you sure?')) deleteMutation.mutate(test._id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No mock tests found. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
