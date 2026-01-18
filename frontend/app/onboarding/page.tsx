"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, CheckCircle, ChevronRight, BookOpen, Coins, Trophy, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEGREE_OPTIONS, DEGREE_EXAMS, getExamsFordegrees } from '@/lib/constants/degrees';

// Steps:
// 1. Budget & Location
// 2. Target Degrees
// 3. Exams & Scores
// 4. Review & Submit

interface ExamScore {
    degree: string;
    exam: string;
    score: number;
    fullMarks: number;
    rank?: number;
    year?: number;
}

import { useQueryClient } from '@tanstack/react-query'; // Import added

function OnboardingContent() {
    const router = useRouter();
    const queryClient = useQueryClient(); // Initialized
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    // Form State with Strict Typing initialization
    const [budget, setBudget] = useState<{ currency: 'INR' | 'USD', amount: string }>({ currency: 'INR', amount: '' });
    const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
    const [targetDegree, setTargetDegree] = useState<string[]>([]);
    const [examScores, setExamScores] = useState<ExamScore[]>([]);

    // Derived State
    const [availableExams, setAvailableExams] = useState<string[]>([]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await api.get('/user/profile');
            const user = res.data.data;

            if (user.onboardingCompleted && !isEditMode) {
                router.replace('/dashboard');
                return;
            }

            if (isEditMode && user.preferences) {
                // Pre-fill logic adapting to new schema
                if (user.preferences.budget) {
                    setBudget({
                        currency: user.preferences.budget.currency || 'INR',
                        amount: user.preferences.budget.amount?.toString() || ''
                    });
                }
                if (user.preferences.preferredCountries) setPreferredCountries(user.preferences.preferredCountries);
                if (user.preferences.targetDegree) setTargetDegree(user.preferences.targetDegree); // New array field
                // Fallback for legacy target_degree string
                if (!user.preferences.targetDegree && user.target_degree) {
                    setTargetDegree(Array.isArray(user.target_degree) ? user.target_degree : [user.target_degree]);
                }

                if (user.preferences.examScores) setExamScores(user.preferences.examScores);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
            setLoading(false);
        }
    };

    // Update available exams when degrees change
    useEffect(() => {
        const exams = getExamsFordegrees(targetDegree);
        setAvailableExams(exams);
    }, [targetDegree]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const validateStep1 = () => {
        if (!budget.amount || Number(budget.amount) <= 0) return false;
        if (preferredCountries.length === 0) return false;
        return true;
    };

    const validateStep2 = () => {
        return targetDegree.length > 0;
    };

    const validateStep3 = () => {
        // Optional to have exams, but if added, must be valid
        if (examScores.length === 0) return true; // Can skip
        return examScores.every(e => e.score >= 0 && e.fullMarks > 0 && e.score <= e.fullMarks);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                budget: {
                    currency: budget.currency,
                    amount: Number(budget.amount)
                },
                preferredCountries,
                targetDegree,
                examScores
            };

            await api.post('/user/preferences', payload);
            toast.success("Preferences Saved Successfully!");

            // Force refetch user to update onboardingCompleted status
            await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
            await queryClient.refetchQueries({ queryKey: ['auth-user'] });

            // Allow animation time
            setTimeout(() => {
                router.replace('/dashboard');
            }, 800);

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save preferences");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper for Exam Score Input
    const addExamScore = () => {
        setExamScores([...examScores, { degree: targetDegree[0] || '', exam: availableExams[0] || '', score: 0, fullMarks: 100 }]);
    };

    const updateExamScore = (index: number, field: keyof ExamScore, value: any) => {
        const newScores = [...examScores];
        newScores[index] = { ...newScores[index], [field]: value };
        setExamScores(newScores);
    };

    const removeExamScore = (index: number) => {
        setExamScores(examScores.filter((_, i) => i !== index));
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
                    {isEditMode ? 'Update Your Preferences' : 'Build Your Academic Profile'}
                </h2>

                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        {/* Progress Bar */}
                        <div className="bg-gray-100 h-1.5 w-full">
                            <div
                                className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>

                        <div className="p-8 md:p-10">
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Coins size={24} /></div>
                                        Budget & Location
                                    </h3>

                                    {/* Budget Input */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Maximum Annual Budget (Fees + Living)
                                        </label>
                                        <div className="flex rounded-lg shadow-sm">
                                            <select
                                                value={budget.currency}
                                                onChange={(e) => setBudget({ ...budget, currency: e.target.value as any })}
                                                className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                            </select>
                                            <input
                                                type="number"
                                                className="flex-1 block w-full min-w-0 rounded-none rounded-r-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg py-3 px-4"
                                                placeholder={budget.currency === 'INR' ? "e.g. 2000000" : "e.g. 25000"}
                                                value={budget.amount}
                                                onChange={(e) => setBudget({ ...budget, amount: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            This helps us filter affordable colleges immediately.
                                        </p>
                                    </div>

                                    {/* Country Selection */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Preferred Countries</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['India', 'USA', 'UK', 'Canada', 'Germany', 'Australia'].map(country => (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        const exists = preferredCountries.includes(country);
                                                        if (exists) setPreferredCountries(preferredCountries.filter(c => c !== country));
                                                        else setPreferredCountries([...preferredCountries, country]);
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${preferredCountries.includes(country)
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleNext}
                                        disabled={!validateStep1()}
                                        className="w-full py-6 text-lg rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01]"
                                    >
                                        Next Step <ChevronRight className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><BookOpen size={24} /></div>
                                        Target Degrees
                                    </h3>

                                    <p className="text-gray-500">Select all that apply.</p>

                                    <div className="space-y-6">
                                        {Object.entries(DEGREE_OPTIONS).map(([category, degrees]) => (
                                            <div key={category}>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{category}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {degrees.map(degree => (
                                                        <button
                                                            key={degree}
                                                            onClick={() => {
                                                                const exists = targetDegree.includes(degree);
                                                                if (exists) setTargetDegree(targetDegree.filter(d => d !== degree));
                                                                else setTargetDegree([...targetDegree, degree]);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${targetDegree.includes(degree)
                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {degree}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={handleBack} className="w-1/3 py-6 rounded-xl">Back</Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!validateStep2()}
                                            className="w-2/3 py-6 rounded-xl shadow-lg shadow-indigo-200"
                                        >
                                            Next Step <ChevronRight className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Trophy size={24} /></div>
                                        Exams & Scores
                                    </h3>

                                    <div className="space-y-4">
                                        {availableExams.length === 0 ? (
                                            <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                                No specific exams found for your selected degrees. You can proceed.
                                            </div>
                                        ) : (
                                            examScores.map((score, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Examination</label>
                                                            <select
                                                                value={score.exam}
                                                                onChange={(e) => updateExamScore(idx, 'exam', e.target.value)}
                                                                className="w-full mt-1 p-2 rounded-lg border-gray-300 text-sm"
                                                            >
                                                                {availableExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Degree</label>
                                                            <select
                                                                value={score.degree}
                                                                disabled
                                                                className="w-full mt-1 p-2 rounded-lg border-gray-300 text-sm bg-gray-100"
                                                            >
                                                                {targetDegree.map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Score</label>
                                                            <input
                                                                type="number"
                                                                value={score.score}
                                                                onChange={(e) => updateExamScore(idx, 'score', Number(e.target.value))}
                                                                className="w-full mt-1 p-2 rounded-lg border-gray-300 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                                            <input
                                                                type="number"
                                                                value={score.fullMarks}
                                                                onChange={(e) => updateExamScore(idx, 'fullMarks', Number(e.target.value))}
                                                                className="w-full mt-1 p-2 rounded-lg border-gray-300 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500">Rank (Opt)</label>
                                                            <input
                                                                type="number"
                                                                value={score.rank || ''}
                                                                onChange={(e) => updateExamScore(idx, 'rank', Number(e.target.value))}
                                                                className="w-full mt-1 p-2 rounded-lg border-gray-300 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    {(score.score > score.fullMarks) && (
                                                        <p className="text-xs text-red-500 mt-2 font-medium">Score cannot exceed full marks.</p>
                                                    )}
                                                    <button
                                                        onClick={() => removeExamScore(idx)}
                                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}

                                        {availableExams.length > 0 && (
                                            <Button variant="outline" onClick={addExamScore} className="w-full border-dashed border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                                <Plus className="mr-2" size={16} /> Add Exam Score
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={handleBack} className="w-1/3 py-6 rounded-xl">Back</Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!validateStep3()}
                                            className="w-2/3 py-6 rounded-xl shadow-lg shadow-indigo-200"
                                        >
                                            Next Step <ChevronRight className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-100 shadow-xl">
                                        <CheckCircle size={40} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-gray-900">All Systems Go!</h3>
                                        <p className="text-gray-500">We've personalized your RESTART experience.</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-4 max-w-sm mx-auto">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Budget</span>
                                            <span className="font-bold text-gray-800">{budget.currency} {Number(budget.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Degrees</span>
                                            <span className="font-bold text-gray-800 text-right">{targetDegree.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Countries</span>
                                            <span className="font-bold text-gray-800">{preferredCountries.length} Selected</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 justify-center">
                                        <Button variant="ghost" onClick={handleBack} className="text-gray-500 hover:text-gray-800">Review</Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="min-w-[200px] py-6 rounded-xl shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : "Launch Dashboard"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
            <OnboardingContent />
        </Suspense>
    );
}