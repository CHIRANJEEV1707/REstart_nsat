"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, CheckCircle, ChevronRight, BookOpen, Trophy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEGREE_OPTIONS, getExamsFordegrees } from '@/lib/constants/degrees';
import { useQueryClient } from '@tanstack/react-query';

interface ExamScore {
    degree: string;
    exam: string;
    score: number;
    fullMarks: number;
    rank?: number;
    year?: number;
}

const nsatEntry = (degree: string): ExamScore => ({
    degree,
    exam: 'NSAT',
    score: 0,
    fullMarks: 360,
});

function OnboardingContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const [targetDegree, setTargetDegree] = useState<string[]>([]);
    const [examScores, setExamScores] = useState<ExamScore[]>([nsatEntry('')]);
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
                if (user.preferences.targetDegree) {
                    setTargetDegree(user.preferences.targetDegree);
                } else if (user.target_degree) {
                    setTargetDegree(Array.isArray(user.target_degree) ? user.target_degree : [user.target_degree]);
                }

                if (user.preferences.examScores) {
                    const scores = user.preferences.examScores as ExamScore[];
                    const hasNsat = scores.some((e: ExamScore) => e.exam === 'NSAT');
                    setExamScores(
                        hasNsat
                            ? scores
                            : [nsatEntry(user.preferences.targetDegree?.[0] || ''), ...scores]
                    );
                }
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
            setLoading(false);
        }
    };

    // Update available exams when degrees change; keep NSAT entry's degree in sync
    useEffect(() => {
        const exams = getExamsFordegrees(targetDegree).filter(e => e !== 'NSAT');
        setAvailableExams(exams);
        setExamScores(prev =>
            prev.map(e => e.exam === 'NSAT' ? { ...e, degree: targetDegree[0] || '' } : e)
        );
    }, [targetDegree]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const isExamSelected = (exam: string) => examScores.some(e => e.exam === exam);

    const toggleExam = (exam: string) => {
        if (exam === 'NSAT') return;
        if (isExamSelected(exam)) {
            setExamScores(prev => prev.filter(e => e.exam !== exam));
        } else {
            setExamScores(prev => [
                ...prev,
                { degree: targetDegree[0] || '', exam, score: 0, fullMarks: 100 },
            ]);
        }
    };

    const updateExamScore = (index: number, field: keyof ExamScore, value: any) => {
        setExamScores(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const validateStep1 = () => targetDegree.length > 0;
    const validateStep2 = () =>
        examScores.every(e => e.score >= 0 && e.fullMarks > 0 && e.score <= e.fullMarks);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('/user/preferences', {
                targetDegree,
                examScores,
                budget: { currency: 'INR', amount: 1 },
                preferredCountries: ['India'],
            });
            toast.success("Preferences Saved Successfully!");
            await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
            await queryClient.refetchQueries({ queryKey: ['auth-user'] });
            setTimeout(() => router.replace('/dashboard'), 800);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save preferences");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

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
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        <div className="p-8 md:p-10">

                            {/* Step 1: Academic Details */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                            <BookOpen size={24} />
                                        </div>
                                        Academic Details
                                    </h3>

                                    <p className="text-gray-500">Select the degrees you're targeting.</p>

                                    <div className="space-y-6">
                                        {Object.entries(DEGREE_OPTIONS).map(([category, degrees]) => (
                                            <div key={category}>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                    {category}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {degrees.map(degree => (
                                                        <button
                                                            key={degree}
                                                            onClick={() => {
                                                                const exists = targetDegree.includes(degree);
                                                                if (exists) setTargetDegree(targetDegree.filter(d => d !== degree));
                                                                else setTargetDegree([...targetDegree, degree]);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                                                targetDegree.includes(degree)
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

                                    <Button
                                        onClick={handleNext}
                                        disabled={!validateStep1()}
                                        className="w-full py-6 text-lg rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01]"
                                    >
                                        Next Step <ChevronRight className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Exam Selection */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                            <Trophy size={24} />
                                        </div>
                                        Exam Selection
                                    </h3>

                                    {/* NSAT — always selected, non-deselectable */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Required</label>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-400 rounded-full">
                                            <CheckCircle size={14} className="text-indigo-600" />
                                            <span className="text-sm font-semibold text-indigo-700">NSAT</span>
                                        </div>
                                    </div>

                                    {/* Other exams from selected degrees */}
                                    {availableExams.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Optional</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableExams.map(exam => (
                                                    <button
                                                        key={exam}
                                                        onClick={() => toggleExam(exam)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                            isExamSelected(exam)
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {exam}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Score inputs for all selected exams */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Scores <span className="font-normal text-gray-400">(optional)</span>
                                        </label>
                                        {examScores.map((score, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-gray-700">{score.exam}</span>
                                                    {score.exam !== 'NSAT' && (
                                                        <button
                                                            onClick={() => toggleExam(score.exam)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="text-xs text-gray-500">Score</label>
                                                        <input
                                                            type="number"
                                                            value={score.score || ''}
                                                            onChange={(e) => updateExamScore(idx, 'score', Number(e.target.value))}
                                                            className="w-full mt-1 p-2 rounded-lg border border-gray-300 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Total Marks</label>
                                                        <input
                                                            type="number"
                                                            value={score.fullMarks}
                                                            onChange={(e) => updateExamScore(idx, 'fullMarks', Number(e.target.value))}
                                                            className="w-full mt-1 p-2 rounded-lg border border-gray-300 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Rank (opt)</label>
                                                        <input
                                                            type="number"
                                                            value={score.rank || ''}
                                                            onChange={(e) => updateExamScore(idx, 'rank', Number(e.target.value))}
                                                            className="w-full mt-1 p-2 rounded-lg border border-gray-300 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                {score.score > score.fullMarks && (
                                                    <p className="text-xs text-red-500 mt-2">Score cannot exceed full marks.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <Button variant="outline" onClick={handleBack} className="w-1/3 py-6 rounded-xl">
                                            Back
                                        </Button>
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

                            {/* Step 3: Review & Submit */}
                            {step === 3 && (
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
                                            <span className="text-gray-500 text-sm">Degrees</span>
                                            <span className="font-bold text-gray-800 text-right">
                                                {targetDegree.join(', ') || '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm">Exams</span>
                                            <span className="font-bold text-gray-800">
                                                {examScores.map(e => e.exam).join(', ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 justify-center">
                                        <Button
                                            variant="ghost"
                                            onClick={handleBack}
                                            className="text-gray-500 hover:text-gray-800"
                                        >
                                            Review
                                        </Button>
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
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
