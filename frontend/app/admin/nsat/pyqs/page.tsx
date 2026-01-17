'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, List, ArrowLeft, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

export default function AdminPYQPage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newCategory, setNewCategory] = useState({
        title: '', examType: 'nsat', year: new Date().getFullYear(), description: '', isFree: false
    });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['adminPYQCategories'],
        queryFn: async () => (await api.get('/admin/nsat/pyqs')).data.data
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/admin/nsat/pyqs', {
                ...data,
                slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            });
        },
        onSuccess: () => {
            toast.success('Category created');
            setIsCreating(false);
            setNewCategory({ title: '', examType: 'nsat', year: new Date().getFullYear(), description: '', isFree: false });
            queryClient.invalidateQueries({ queryKey: ['adminPYQCategories'] });
        },
        onError: () => toast.error('Failed to create category')
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
                        <h1 className="text-3xl font-bold text-gray-900">PYQ Categories</h1>
                        <p className="text-gray-500">Manage Previous Year Question papers.</p>
                    </div>
                    <Button onClick={() => setIsCreating(!isCreating)} className={isCreating ? "bg-gray-500" : "bg-green-600 hover:bg-green-700 text-white"}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isCreating ? 'Cancel' : 'Add New Category'}
                    </Button>
                </div>

                {isCreating && (
                    <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm mb-8 animate-in slide-in-from-top-2">
                        <h2 className="font-bold mb-4">New Category Details</h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input value={newCategory.title} onChange={e => setNewCategory({ ...newCategory, title: e.target.value })} placeholder="e.g. NSAT 2024 Phase 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <Input type="number" value={newCategory.year} onChange={e => setNewCategory({ ...newCategory, year: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Exam Type</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={newCategory.examType}
                                    onChange={e => setNewCategory({ ...newCategory, examType: e.target.value })}
                                >
                                    <option value="nsat">NSAT General</option>
                                    <option value="coding-nsat">Coding NSAT</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={newCategory.isFree} onChange={e => setNewCategory({ ...newCategory, isFree: e.target.checked })} className="w-4 h-4" />
                                    <span className="text-sm font-medium">Free Access?</span>
                                </label>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <Input value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Brief description..." />
                            </div>
                        </div>
                        <Button onClick={() => createMutation.mutate(newCategory)} disabled={createMutation.isPending || !newCategory.title}>
                            {createMutation.isPending ? 'Saving...' : 'Create Category'}
                        </Button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((cat: any) => (
                        <div key={cat._id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline">{cat.examType === 'nsat' ? 'General' : 'Coding'}</Badge>
                                {cat.isFree ? <Badge className="bg-green-100 text-green-700">Free</Badge> : <Badge variant="secondary">Premium</Badge>}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{cat.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar className="w-4 h-4 mr-1" /> {cat.year}
                            </div>
                            <Link href={`/admin/nsat/pyqs/${cat._id}/questions`}>
                                <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                    <List className="w-4 h-4 mr-2" />
                                    Manage Questions
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
