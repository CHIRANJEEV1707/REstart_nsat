"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2, ArrowUpRight } from 'lucide-react';
import { useDashboard } from "@/context/DashboardContext";

export function SavedCollegesView() {
    const queryClient = useQueryClient();
    const { setActiveView, openCollegeDetails } = useDashboard();

    const { data: response, isLoading } = useQuery({
        queryKey: ['saved-colleges'],
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
            queryClient.invalidateQueries({ queryKey: ['saved-colleges'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shortlist</h1>

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 w-full bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : response?.data?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {response.data.map((college: any) => (
                        <Card key={college._id} className="group relative overflow-hidden hover:shadow-lg transition-all border-none shadow-sm flex flex-col h-full bg-white">
                            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1" title={college.name}>{college.name}</h3>
                                    {college.location && (
                                        <p className="text-sm text-gray-500 mb-4">{college.location.city}, {college.location.state}</p>
                                    )}
                                    {!college.location && college.city && (
                                        <p className="text-sm text-gray-500 mb-4">{college.city}, {college.country}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button
                                        onClick={() => openCollegeDetails(college._id, college.type || 'indian')}
                                        className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 shadow-none font-semibold"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeMutation.mutate({ id: college._id, type: college.type || 'indian' })}
                                        className="bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-none shrink-0"
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
                    <Button onClick={() => setActiveView("discover-indian")}>
                        Find Colleges
                    </Button>
                </div>
            )}
        </div>
    );
}
