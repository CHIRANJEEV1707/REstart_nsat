"use client";

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle, Mail } from 'lucide-react';

const resetPasswordSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!email) {
            setError('Missing email address. Please start from the forgot password page.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/resetpassword', {
                email,
                otp: data.otp,
                newPassword: data.password
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                    <p className="text-gray-600 mb-6">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link href="/auth/login">
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white">
                            Go to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Check your email for the 6-digit code sent to <strong>{email}</strong>
                    </p>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                        <Input
                            {...register('otp')}
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className={`h-12 text-center text-xl tracking-[0.5em] font-bold ${errors.otp ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.otp && (
                            <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <Input
                            {...register('password')}
                            type="password"
                            placeholder="Min. 6 characters"
                            className={`h-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="Repeat new password"
                            className={`h-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {!email && (
                        <div className="rounded-md bg-yellow-50 p-4">
                            <p className="text-sm text-yellow-800">Email missing. <Link href="/auth/forgot-password" className="underline font-bold">Go back</Link></p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full h-12 flex justify-center items-center text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            'Reset Password'
                        )}
                    </Button>

                    <div className="text-center">
                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                            Didn&apos;t receive code? Resend
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
