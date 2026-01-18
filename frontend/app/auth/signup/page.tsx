"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Step 1: Email only
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email')
});

// Step 2: OTP + Details
const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verificationToken, setVerificationToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const [countdown, setCountdown] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const emailForm = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
    });

    const signupForm = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });

    const handleSendOTP = async (data: EmailForm) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/otp/send', { email: data.email });
            if (res.data.success) {
                setEmail(data.email);
                setOtpSent(true);
                setResendCount(res.data.resendCount || 1);
                setCountdown(30); // 30 second cooldown
                setStep(2);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0 || resendCount >= 5) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/otp/send', { email });
            if (res.data.success) {
                setResendCount(res.data.resendCount || resendCount + 1);
                setCountdown(30);
                setOtp(['', '', '', '', '', '']);
                setError('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            const lastFilledIndex = Math.min(index + digits.length - 1, 5);
            otpRefs.current[lastFilledIndex]?.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = value.replace(/\D/g, '');
            setOtp(newOtp);
            if (value && index < 5) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyAndSignup = async (data: SignupForm) => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Verify OTP
            const verifyRes = await api.post('/auth/otp/verify', { email, otp: otpString });
            if (!verifyRes.data.success) {
                setError(verifyRes.data.message || 'OTP verification failed');
                setLoading(false);
                return;
            }

            const token = verifyRes.data.verificationToken;
            setVerificationToken(token);

            // Step 2: Signup with verification token
            const signupRes = await api.post('/auth/signup', {
                name: data.name,
                email: email,
                password: data.password,
                verificationToken: token
            });

            if (signupRes.status === 201) {
                if (signupRes.data.accessToken) {
                    localStorage.setItem('token', signupRes.data.accessToken);
                }

                // Invalidate auth query
                await queryClient.invalidateQueries({ queryKey: ['auth-user'] });

                // Redirect to onboarding
                router.replace('/onboarding');
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
                {step === 1 ? (
                    <>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Join thousands of students on REstart
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(handleSendOTP)}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    {...emailForm.register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`h-12 ${emailForm.formState.errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <p className="text-sm text-red-800">{error}</p>
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
                                    <>
                                        <Mail className="w-5 h-5 mr-2" />
                                        Send Verification Code
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-500">Already have an account? </span>
                                <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Log in
                                </Link>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <div>
                            <button
                                onClick={() => { setStep(1); setError(''); setOtp(['', '', '', '', '', '']); }}
                                className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    We sent a code to <strong>{email}</strong>
                                </p>
                            </div>
                        </div>

                        <form className="mt-6 space-y-6" onSubmit={signupForm.handleSubmit(handleVerifyAndSignup)}>
                            {/* OTP Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                    Enter 6-digit code
                                </label>
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={digit}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        />
                                    ))}
                                </div>
                                <div className="text-center mt-3">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-gray-500">Resend code in {countdown}s</p>
                                    ) : resendCount < 5 ? (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={loading}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Resend code
                                        </button>
                                    ) : (
                                        <p className="text-sm text-red-500">Maximum resends reached</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <Input
                                        id="name"
                                        {...signupForm.register('name')}
                                        placeholder="John Doe"
                                        className={`h-12 ${signupForm.formState.errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {signupForm.formState.errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        {...signupForm.register('password')}
                                        type="password"
                                        placeholder="Min 6 characters"
                                        className={`h-12 ${signupForm.formState.errors.password ? 'border-red-500' : ''}`}
                                    />
                                    {signupForm.formState.errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        {...signupForm.register('confirmPassword')}
                                        type="password"
                                        placeholder="Confirm password"
                                        className={`h-12 ${signupForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                                    />
                                    {signupForm.formState.errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <p className="text-sm text-red-800">{error}</p>
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
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Create Account
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-500">Already have an account? </span>
                                <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Log in
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
