"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { Loader2, ArrowRight } from 'lucide-react';

interface StepPersonalDetailsProps {
    onComplete: () => void;
}

const COUNTRIES = ["India", "USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Ireland"];

export function StepPersonalDetails({ onComplete }: StepPersonalDetailsProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        country: 'India',
        city: '',
        phoneNumber: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/user/onboarding', {
                step: 2,
                data: formData
            });
            onComplete();
        } catch (error) {
            console.error("Failed to save personal details", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                <p className="text-gray-500 mt-2">We need this to personalize your experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Country of Residence</label>
                    <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <Input
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="h-12"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (Optional)</label>
                    <div className="flex">
                        <span className="h-12 flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-medium">
                            +91
                        </span>
                        <Input
                            placeholder="9876543210"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="h-12 rounded-l-none"
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <span className="flex items-center gap-2">Continue <ArrowRight size={18} /></span>
                    )}
                </Button>
            </form>
        </div>
    );
}
