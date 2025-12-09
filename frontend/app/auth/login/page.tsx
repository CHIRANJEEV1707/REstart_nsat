"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', formData);
            if (res.status === 200) {
                // Hard reload to ensure middleware catches the new cookie
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
                <p className="text-gray-500 mb-8 text-center">Enter your credentials to access your dashboard.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        required
                        onChange={handleChange}
                        className="h-12"
                    />
                    <Input
                        name="password"
                        placeholder="Password"
                        type="password"
                        required
                        onChange={handleChange}
                        className="h-12"
                    />

                    <div className="text-right">
                        <Link href="/auth/forgot" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <Link href="/auth/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
