'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft, Check, X, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function AdminOrdersPage() {
    const queryClient = useQueryClient();
    const [viewingProof, setViewingProof] = useState<string | null>(null);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await api.get('/admin/orders?status=pending');
            return res.data.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async ({ orderId, action }: { orderId: string, action: 'approve' | 'reject' }) => {
            const res = await api.post('/admin/orders/approve', { orderId, action });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success("Order status updated");
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update status");
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster />

            {/* Image Modal */}
            {viewingProof && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        <img src={viewingProof} alt="Proof" className="w-full h-full object-contain rounded-lg" />
                        <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2" onClick={() => setViewingProof(null)}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
                    </div>
                ) : !orders?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Check className="w-12 h-12 mb-4 text-green-500" />
                        <p className="text-lg font-medium">All caught up! No pending orders.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900">{order.productSlug}</h3>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{order._id}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-gray-700">{order.userId?.name}</span>
                                            <span>({order.userId?.email})</span>
                                        </div>
                                        <div>₹{order.amount}</div>
                                        <div>{new Date(order.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {order.proofUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewingProof(order.proofUrl)}
                                            className="gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Proof
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                                        <Button
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50 border-red-200"
                                            onClick={() => mutation.mutate({ orderId: order._id, action: 'reject' })}
                                            disabled={mutation.isPending}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => mutation.mutate({ orderId: order._id, action: 'approve' })}
                                            disabled={mutation.isPending}
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
