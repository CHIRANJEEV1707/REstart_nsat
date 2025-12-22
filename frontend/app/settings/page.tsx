"use client";

import Navbar from "@/components/Navbar";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from 'react-hot-toast';
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function SettingsPage() {
    const router = useRouter();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return await api.put('/auth/updatepassword', data);
        },
        onSuccess: () => {
            toast.success("Password updated successfully!");
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update password.");
        }
    });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        mutation.mutate({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
        });
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            Cookies.remove('token');
            router.push('/');
        } catch (error) {
            console.error(error);
            toast.error("Failed to logout. Please try again.");
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-2xl mx-auto pt-32 px-6 space-y-8">
                    <h1 className="text-3xl font-bold">Account Settings</h1>

                    {/* Change Password */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
                        <p className="text-gray-500 mb-6">Sign out of your account or delete your data.</p>
                        <div className="flex gap-4">
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
