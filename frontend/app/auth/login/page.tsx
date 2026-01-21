"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

type LoginEvaluated = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginEvaluated>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    });

    const onSubmit = async (data: LoginEvaluated) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', data);

            if (res.status === 200) {
                // Save token to localStorage for fallback if cookies fail
                if (res.data.accessToken) {
                    localStorage.setItem('token', res.data.accessToken);
                }

                // Invalidate auth query to force refetch with new credentials
                await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                await queryClient.refetchQueries({ queryKey: ['auth-user'] });

                const isComplete = res.data.data.onboardingCompleted;
                // Check completion status and redirect
                if (isComplete) {
                    router.replace('/dashboard');
                } else {
                    router.replace('/onboarding');
                }
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            console.error('Login error:', error);
            if (error.response && error.response.status === 401) {
                setError('Invalid credentials. If you just deployed, please Sign Up again.');
            } else {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Continue your college journey
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <Input
                                id="email"
                                {...register('email')}
                                type="email"
                                placeholder="name@example.com"
                                className={`h-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className={`h-12 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                {...register('rememberMe')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </Link>
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
                        className="w-full h-12 flex justify-center items-center text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : (
                            'Sign in'
                        )}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Don&apos;t have an account? </span>
                        <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
