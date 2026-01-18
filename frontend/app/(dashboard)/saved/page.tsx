"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function SavedCollegesPage() {
    const queryClient = useQueryClient();
    const { data: response, isLoading } = useQuery({
        queryKey: ['saved'],
        queryFn: async () => {
            const res = await api.get('/saved');
            return res.data;
        }
    });

    const removeMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: string }) => {
            await api.delete(`/saved/${id}?type=${type}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shortlist</h1>

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>)}
                </div>
            ) : response?.data.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {response.data.map((college: any) => (
                        <Card key={college._id} className="group relative overflow-hidden hover:shadow-lg transition-all border-none shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{college.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">{college.location.city}, {college.location.state}</p>
                                <div className="flex gap-3">
                                    <Button asChild className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 shadow-none">
                                        <Link href={`/college/${college._id}`}>View Details</Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeMutation.mutate({ id: college._id, type: college.type })}
                                        className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-none"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-400 mb-4">No colleges saved yet</h2>
                    <Button asChild>
                        <Link href="/dashboard">Find Colleges</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
