'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, ArrowLeft, Book } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminInterviewGuidesPage() {
    const queryClient = useQueryClient();

    const { data: guides, isLoading } = useQuery({
        queryKey: ['adminInterviewGuides'],
        queryFn: async () => (await api.get('/admin/nsat/interview-guides')).data.data
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/nsat/interview-guides/${id}`);
        },
        onSuccess: () => {
            toast.success('Guide deleted');
            queryClient.invalidateQueries({ queryKey: ['adminInterviewGuides'] });
        },
        onError: () => toast.error('Failed to delete guide')
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
                        <h1 className="text-3xl font-bold text-gray-900">Interview Guides</h1>
                        <p className="text-gray-500">Create content for interview preparation.</p>
                    </div>
                    <Link href="/admin/nsat/interview-guides/create">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Guide
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides?.map((guide: any) => (
                        <div key={guide._id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all relative">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="secondary" className="capitalize">{guide.guideType}</Badge>
                                {guide.isFree ? <Badge className="bg-green-100 text-green-700">Free</Badge> : <Badge className="bg-gray-100 text-gray-700">Premium</Badge>}
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2 truncate" title={guide.title}>{guide.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{guide.description}</p>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                                <Link href={`/admin/nsat/interview-guides/${guide._id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-3 h-3 mr-2" /> Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('Delete this guide?')) deleteMutation.mutate(guide._id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {guides?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                            No guides found. Create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
