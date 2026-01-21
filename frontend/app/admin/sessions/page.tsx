'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft, Check, X, ExternalLink, Calendar, User, Mail, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function AdminSessionsPage() {
    const queryClient = useQueryClient();
    const [viewingProof, setViewingProof] = useState<string | null>(null);
    const [adminPassword, setAdminPassword] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Initial check for persisted password
    useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_password');
            if (saved) {
                setAdminPassword(saved);
                setIsAuthenticated(true);
            }
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('admin_password', adminPassword);
        setIsAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    };

    const { data: bookings, isLoading, error } = useQuery({
        queryKey: ['admin-sessions', adminPassword],
        queryFn: async () => {
            const res = await api.get('/admin/sessions?status=pending_verification', {
                headers: { 'x-admin-password': adminPassword }
            });
            return res.data.data;
        },
        enabled: isAuthenticated,
        retry: false
    });

    const mutation = useMutation({
        mutationFn: async ({ bookingId, action }: { bookingId: string, action: 'approve' | 'reject' }) => {
            const res = await api.post('/admin/sessions/approve',
                { bookingId, action },
                { headers: { 'x-admin-password': adminPassword } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
            toast.success("Session status updated");
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update status");
        }
    });

    if (!isAuthenticated || (error as any)?.response?.status === 401) {
        if ((error as any)?.response?.status === 401 && isAuthenticated) {
            localStorage.removeItem('admin_password');
            setIsAuthenticated(false);
            toast.error("Invalid password or session expired");
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Toaster />
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Session Admin</h1>
                        <p className="text-gray-500 mt-2">Enter admin password to continue</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="Password..."
                            autoFocus
                        />
                        <Button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
                            Access Panel
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster />

            {/* Image Modal */}
            {viewingProof && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingProof(null)}>
                    <div className="relative w-full max-w-5xl flex items-center justify-center h-full">
                        <img
                            src={viewingProof}
                            alt="Proof"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-50 backdrop-blur-md"
                            onClick={() => setViewingProof(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Session Approvals</h1>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            localStorage.removeItem('admin_password');
                            setIsAuthenticated(false);
                            setAdminPassword('');
                        }}
                    >
                        Log Out
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-xl" />)}
                    </div>
                ) : !bookings?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Calendar className="w-12 h-12 mb-4 text-emerald-500" />
                        <p className="text-lg font-medium">No pending session verifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking: any) => (
                            <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={booking.sessionType === 'interview-prep' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'}>
                                            {booking.sessionType === 'interview-prep' ? 'Interview Prep' : 'REstart Unfiltered'}
                                        </Badge>
                                        <span className="text-xs font-mono text-gray-400">{booking._id}</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-y-2 gap-x-8">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{booking.userName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{booking.userEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                            <span className="font-bold text-gray-900">₹{booking.amount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(booking.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0">
                                    {booking.proofUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewingProof(booking.proofUrl)}
                                            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Proof
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                                        <Button
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to reject this payment?')) {
                                                    mutation.mutate({ bookingId: booking._id, action: 'reject' });
                                                }
                                            }}
                                            disabled={mutation.isPending}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                                            onClick={() => mutation.mutate({ bookingId: booking._id, action: 'approve' })}
                                            disabled={mutation.isPending}
                                        >
                                            <Check className="w-4 h-4 mr-1" />
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
