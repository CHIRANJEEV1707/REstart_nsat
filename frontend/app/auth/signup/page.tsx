"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        state: '',
        class_level: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/signup', formData);
            if (res.status === 201) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create Account</h1>
                <p className="text-gray-500 mb-8 text-center">Join thousands of students on REstart.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="name" placeholder="Full Name" required onChange={handleChange} />
                    <Input name="email" type="email" placeholder="Email Address" required onChange={handleChange} />
                    <Input name="password" type="password" placeholder="Password (min 6 chars)" required onChange={handleChange} minLength={6} />

                    <div className="grid grid-cols-2 gap-4">
                        <select name="state" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" onChange={handleChange} required>
                            <option value="">Select State</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                            {/* Add more states */}
                        </select>
                        <select name="class_level" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" onChange={handleChange} required>
                            <option value="">Class Level</option>
                            <option value="11th">Class 11</option>
                            <option value="12th">Class 12</option>
                            <option value="Dropper">Dropper</option>
                        </select>
                    </div>

                    <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
}
