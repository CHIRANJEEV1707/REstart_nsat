"use client";

import Navbar from "@/components/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => (await api.get('/auth/me')).data
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        state: '',
        class_level: '',
        target_exams: ''
    });

    useEffect(() => {
        if (data?.data) {
            setFormData({
                name: data.data.name || '',
                email: data.data.email || '',
                state: data.data.state || '',
                class_level: data.data.class_level || '',
                target_exams: data.data.target_exams?.join(', ') || ''
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (newData: any) => {
            return await api.put('/auth/updatedetails', newData);
        },
        onSuccess: () => {
            alert("Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
        onError: () => {
            alert("Failed to update profile.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            target_exams: formData.target_exams.split(',').map(s => s.trim()).filter(Boolean)
        });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto pt-32 px-6">
                <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                disabled
                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={formData.email}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Maharashtra"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.class_level}
                                    onChange={e => setFormData({ ...formData, class_level: e.target.value })}
                                >
                                    <option value="">Select Class</option>
                                    <option value="11th">11th</option>
                                    <option value="12th">12th</option>
                                    <option value="Dropper">Dropper</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Exams (comma separated)</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="JEE Main, MHT CET, BITSAT"
                                value={formData.target_exams}
                                onChange={e => setFormData({ ...formData, target_exams: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
