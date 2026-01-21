'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft, Check, X, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function AdminClaimsPage() {
    const queryClient = useQueryClient();
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
        queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
    };

    const { data: claims, isLoading, error } = useQuery({
        queryKey: ['admin-claims', adminPassword],
        queryFn: async () => {
            const res = await api.get('/admin/claims', {
                headers: { 'x-admin-password': adminPassword }
            });
            return res.data.data;
        },
        enabled: isAuthenticated,
        retry: false
    });

    const mutation = useMutation({
        mutationFn: async ({ claimId, status }: { claimId: string, status: 'approved' | 'rejected' }) => {
            const res = await api.put(`/admin/claims/${claimId}`,
                { status },
                { headers: { 'x-admin-password': adminPassword } }
            );
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
            toast.success(`Claim ${variables.status} successfully`);
        },
        onError: (err: any) => {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update claim");
        }
    });

    // Handle 401 error
    useEffect(() => {
        if ((error as any)?.response?.status === 401 && isAuthenticated) {
            localStorage.removeItem('admin_password');
            setIsAuthenticated(false);
            toast.error("Invalid password or session expired");
        }
    }, [error, isAuthenticated]);

    if (!isAuthenticated || (error as any)?.response?.status === 401) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Toaster />
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Claims Access</h1>
                        <p className="text-gray-500 mt-2">Enter admin password to continue</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Password..."
                            autoFocus
                        />
                        <Button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                            Access Claims Panel
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Referral Claims</h1>
                            <p className="text-gray-500 text-sm">Review and approve free bundle claims</p>
                        </div>
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
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
                    </div>
                ) : !claims?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Check className="w-12 h-12 mb-4 text-green-500" />
                        <p className="text-lg font-medium">No pending claims.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim: any) => (
                            <div key={claim._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant={claim.status === 'pending' ? 'secondary' : claim.status === 'approved' ? 'default' : 'destructive'}>
                                            {claim.status.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                            {new Date(claim.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Claimant Details</div>
                                            <div className="font-medium text-gray-900">{claim.name}</div>
                                            <div className="text-sm text-gray-600">{claim.phoneNumber}</div>
                                            <div className="text-sm text-gray-600">{claim.registeredEmail}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">App User</div>
                                            {claim.userId ? (
                                                <>
                                                    <div className="flex items-center gap-1 text-sm font-medium">
                                                        <User className="w-3 h-3" /> {claim.userId.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{claim.userId.email}</div>
                                                </>
                                            ) : (
                                                <span className="text-red-500 text-sm">User ID mismatch/Deleted</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {claim.status === 'pending' && (
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        <Button
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50 border-red-200"
                                            onClick={() => mutation.mutate({ claimId: claim._id, status: 'rejected' })}
                                            disabled={mutation.isPending}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => mutation.mutate({ claimId: claim._id, status: 'approved' })}
                                            disabled={mutation.isPending}
                                        >
                                            Approve & Grant
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
