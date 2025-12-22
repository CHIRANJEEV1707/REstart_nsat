"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupEvaluated = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupEvaluated>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupEvaluated) => {
        setLoading(true);
        setError('');

        try {
            // API expects name, email, password. We exclude confirmPassword.
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password
            };

            const res = await api.post('/auth/signup', payload);

            if (res.status === 201) {
                // Successful signup → Redirect to onboarding (MANDATORY)
                setTimeout(() => {
                    router.replace('/onboarding');
                }, 100);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Join thousands of students on REstart
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Input
                                {...register('name')}
                                placeholder="Full Name"
                                className={`h-12 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Email Address"
                                className={`h-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="Password (min 6 chars)"
                                className={`h-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="Confirm Password"
                                className={`h-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 flex justify-center items-center text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
