"use client";

import { DEGREE_EXAM_MAP, DEGREES } from '@/constants/degrees';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Loader2, Save, User, MapPin, BookOpen, GraduationCap, Plus, Trash2, Check, Sparkles, Scale, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const queryClient = useQueryClient();

    // --- Data Fetching ---
    const { data: profileData, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await api.get('/user/profile');
            return res.data.data;
        }
    });

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const user = profileData;

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <PersonalInfoSection user={user} />
            <PreferencesSection user={user} />
            <PurchasedBundlesSection user={user} />
            <ExamScoresSection user={user} />
        </div>
    );
}

function PurchasedBundlesSection({ user }: { user: any }) {
    const purchasedBundles = user?.purchasedBundles || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Purchased Bundles
                </CardTitle>
            </CardHeader>
            <CardContent>
                {purchasedBundles && purchasedBundles.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {purchasedBundles.map((pb: any) => {
                            const bundle = pb.bundleId;
                            // Check if bundle is populated (it should be)
                            if (!bundle) return null;

                            return (
                                <div key={pb._id || bundle._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col transition-colors hover:border-blue-200 hover:bg-blue-50/50">
                                    <h4 className="font-bold text-lg mb-1 text-gray-900">{bundle.title}</h4>
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-sm text-gray-500 font-medium">{bundle.exam}</p>
                                        <span className="text-xs text-gray-400">
                                            Purchased on {new Date(pb.purchasedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link href={`/prep/${bundle.slug}`} className="mt-auto">
                                        <Button variant="outline" size="sm" className="w-full bg-white hover:bg-blue-600 hover:text-white border-blue-200 text-blue-700">
                                            Access Content
                                        </Button>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No Bundle</p>
                )}
            </CardContent>
        </Card>
    );
}

// --- Sections Components ---

function PersonalInfoSection({ user }: { user: any }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.profile?.phoneNumber || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        country: user.profile?.country || ''
    });
    const [isSaved, setIsSaved] = useState(false);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // Basic client-side validation
            if (!data.name) throw new Error("Name is required");
            await api.patch('/user/profile', {
                name: data.name,
                phone: data.phone,
                address: { city: data.city, state: data.state, country: data.country }
            });
        },
        onSuccess: () => {
            setIsSaved(true);
            toast.success("Personal Info Updated");
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setTimeout(() => setIsSaved(false), 2000);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    });

    const handleSave = () => {
        mutation.mutate(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input value={user.email} disabled className="bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium">City</label>
                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">State</label>
                        <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Country</label>
                        <Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={mutation.isPending || isSaved}
                        className={`transition-all ${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> :
                            isSaved ? <Check className="w-4 h-4 mr-2" /> :
                                <Save className="w-4 h-4 mr-2" />}
                        {mutation.isPending ? 'Saving...' : isSaved ? 'Saved' : 'Save Info'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PreferencesSection({ user }: { user: any }) {
    const queryClient = useQueryClient();
    const prefs = user.preferences || {};
    const [formData, setFormData] = useState({
        goal: prefs.goal || '',
        budgetMax: prefs.budgetMax || 0,
        preferredCountries: prefs.preferredCountries || [],
        collegeTypes: prefs.collegeTypes || [],
        examsInterested: prefs.examsInterested || [],
        collegeTypePreference: prefs.collegeTypePreference || null
    });

    const isIndia = formData.preferredCountries.includes('India');

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // We need to send full payload expected by savePreferences or partial?
            // savePreferences logic merges, so partial is okay-ish but it validates 'preferredCountries' as required.
            // Ensure we send all necessary fields.
            await api.post('/user/preferences', {
                ...prefs, // keep existing fields that we might not edit here? Or just what we have.
                ...data,
                // ensure optional fields are valid
            });
        },
        onSuccess: () => {
            toast.success("Preferences Updated");
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-recommendations'] });
        }
    });

    // Helper for multi-select (simple toggle for now)
    const toggleItem = (list: string[], item: string, field: string) => {
        const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
        setFormData({ ...formData, [field]: newList });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> College Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


                {/* New-Gen College Preference (High Signal) */}
                <div className="p-5 border border-indigo-100 bg-indigo-50/50 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-indigo-950">New-Gen College Preference</h3>
                            <p className="text-xs text-indigo-800/80 mt-1 max-w-lg">
                                New-Gen colleges focus on industry-driven curriculum, startup exposure, and modern learning models (e.g. Newton School of Technology, Scaler School of Technology).
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {[
                            { id: 'prefer_new_gen', label: 'Strongly Prefer New-Gen', icon: Sparkles, desc: 'Boost New-Gen colleges' },
                            { id: 'neutral', label: 'Open to Both', icon: Scale, desc: 'No specific preference' },
                            { id: 'prefer_traditional', label: 'Traditional Only', icon: Landmark, desc: 'Exclude New-Gen colleges' }
                        ].map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setFormData({ ...formData, collegeTypePreference: option.id })}
                                className={`
                                    relative flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all
                                    ${formData.collegeTypePreference === option.id
                                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600'
                                        : 'border-transparent bg-white hover:bg-gray-50 border-gray-200'}
                                `}
                            >
                                <option.icon className={`w-5 h-5 mb-2 ${formData.collegeTypePreference === option.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                                <span className="font-medium text-sm text-gray-900">{option.label}</span>
                                {formData.collegeTypePreference === option.id && (
                                    <div className="absolute top-2 right-2 text-indigo-600">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {!formData.collegeTypePreference && (
                        <p className="text-xs text-amber-600 font-medium">Please select a preference to save.</p>
                    )}
                </div>

                {/* Countries */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Countries</label>
                    <div className="flex flex-wrap gap-2">
                        {['India', 'USA', 'UK', 'Canada', 'Germany', 'Australia'].map(c => (
                            <div key={c}
                                onClick={() => toggleItem(formData.preferredCountries, c, 'preferredCountries')}
                                className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${formData.preferredCountries.includes(c) ? 'bg-black text-white' : 'bg-white'}`}>
                                {c}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Budget */}
                <div className="max-w-xs">
                    <label className="text-sm font-medium mb-1 block">Max Budget ({isIndia ? 'INR' : 'USD'})</label>
                    <Input
                        type="number"
                        placeholder={isIndia ? "e.g. 500000" : "e.g. 10000"}
                        value={formData.budgetMax || ''}
                        onChange={e => setFormData({ ...formData, budgetMax: e.target.value ? Number(e.target.value) : 0 })}
                    />
                </div>

                {/* College Types */}
                <div>
                    <label className="text-sm font-medium mb-2 block">College Types</label>
                    <div className="flex flex-wrap gap-2">
                        {['Engineering', 'Management', 'Research', 'Liberal Arts', 'Private', 'Government'].map(t => (
                            <div key={t}
                                onClick={() => toggleItem(formData.collegeTypes, t, 'collegeTypes')}
                                className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${formData.collegeTypes.includes(t) ? 'bg-black text-white' : 'bg-white'}`}>
                                {t}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending || !formData.collegeTypePreference}>
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Preferences
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ExamScoresSection({ user }: { user: any }) {
    const queryClient = useQueryClient();
    const [scores, setScores] = useState<any[]>(user.preferences?.examScores || []);

    // Multi-Select Degree Filter
    const [selectedDegreeFilter, setSelectedDegreeFilter] = useState<string[]>([]);

    // New Exam Form State
    const [newExam, setNewExam] = useState({
        exam: '',
        score: '',
        fullMarks: '',
        rank: '',
        year: new Date().getFullYear().toString()
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaved, setIsSaved] = useState(false);

    // Derived state: available exams based on selected filters (or all if none selected?)
    // User requirement: "Based on selected degree(s), dynamically populate an exam dropdown."
    const availableExams = selectedDegreeFilter.length > 0
        ? selectedDegreeFilter.flatMap(d => DEGREE_EXAM_MAP[d as keyof typeof DEGREE_EXAM_MAP] || [])
        : [];

    // Helper to find degree for a selected exam
    const getDegreeForExam = (examName: string) => {
        return DEGREES.find(d => (DEGREE_EXAM_MAP[d] as readonly string[]).includes(examName)) || '';
    };

    const toggleDegreeFilter = (degree: string) => {
        setSelectedDegreeFilter(prev =>
            prev.includes(degree) ? prev.filter(d => d !== degree) : [...prev, degree]
        );
        // Reset exam selection if it's no longer valid?
        // Let's keep it simple: just reset exam if filter changes to avoid mismatch
        setNewExam(prev => ({ ...prev, exam: '' }));
    };

    const mutation = useMutation({
        mutationFn: async (newScores: any[]) => {
            const validScores = newScores.map(s => ({
                degree: s.degree, // Ensure degree is passed
                exam: s.exam,
                score: Number(s.score),
                fullMarks: Number(s.fullMarks),
                rank: s.rank ? Number(s.rank) : undefined,
                year: s.year ? Number(s.year) : undefined
            }));
            await api.patch('/user/exams', { examScores: validScores });
        },
        onSuccess: () => {
            setIsSaved(true);
            toast.success("Exams Updated Successfully");
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-recommendations'] });
            setTimeout(() => setIsSaved(false), 2000);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update exams");
        }
    });

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!newExam.exam) newErrors.exam = "Please select an exam";
        if (!newExam.score) newErrors.score = "Score is required";
        if (Number(newExam.score) < 0) newErrors.score = "Score cannot be negative";
        if (!newExam.fullMarks) newErrors.fullMarks = "Full Marks required";
        if (Number(newExam.fullMarks) <= 0) newErrors.fullMarks = "Must be positive";
        if (Number(newExam.score) > Number(newExam.fullMarks)) newErrors.score = "Exceeds Full Marks";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addScore = () => {
        if (!validateForm()) return;

        const degree = getDegreeForExam(newExam.exam);
        if (!degree) {
            toast.error("Invalid Exam Selection");
            return;
        }

        const scoreEntry = {
            degree,
            exam: newExam.exam,
            score: Number(newExam.score),
            fullMarks: Number(newExam.fullMarks),
            rank: newExam.rank ? Number(newExam.rank) : undefined,
            year: Number(newExam.year)
        };

        const updated = [...scores, scoreEntry];
        setScores(updated);

        // Reset form
        setNewExam({
            exam: '',
            score: '',
            fullMarks: '',
            rank: '',
            year: new Date().getFullYear().toString()
        });
        setErrors({});
    };

    const removeScore = (index: number) => {
        const updated = scores.filter((_, i) => i !== index);
        setScores(updated);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Exam Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Current Scores List */}
                <div className="space-y-3">
                    {scores.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{s.exam}</span>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{s.degree}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Score: <span className="font-medium text-gray-900">{s.score}/{s.fullMarks}</span>
                                    {s.rank && <span className="ml-3 text-gray-500">Rank: {s.rank}</span>}
                                    {s.year && <span className="ml-3 text-gray-500">({s.year})</span>}
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeScore(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {scores.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No exam scores added yet.</p>}
                </div>

                {/* Add New Exam Form */}
                <div className="border rounded-xl p-5 bg-white shadow-sm space-y-5">
                    <h4 className="text-sm font-semibold text-gray-800">Add New Exam Score</h4>

                    {/* Degree Filter (Multi-Select) */}
                    <div>
                        <label className="text-xs font-medium mb-2 block text-gray-500">Filter Exams by Degree(s)</label>
                        <div className="flex flex-wrap gap-2">
                            {DEGREES.map(d => (
                                <button
                                    key={d}
                                    onClick={() => toggleDegreeFilter(d)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${selectedDegreeFilter.includes(d)
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        {selectedDegreeFilter.length === 0 && <p className="text-xs text-amber-600 mt-1">Please select at least one degree to see exams.</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Exam Selection (Filtered) */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium mb-1 block text-gray-500">Select Exam *</label>
                            <select
                                className={`w-full p-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${errors.exam ? 'border-red-500' : 'border-gray-200'}`}
                                value={newExam.exam}
                                onChange={e => setNewExam({ ...newExam, exam: e.target.value })}
                                disabled={availableExams.length === 0}
                            >
                                <option value="">
                                    {selectedDegreeFilter.length === 0 ? "Select a degree above first" : "Select Exam"}
                                </option>
                                {availableExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </select>
                            {errors.exam && <p className="text-xs text-red-500 mt-1">{errors.exam}</p>}
                        </div>

                        {/* Numeric Inputs */}
                        <div>
                            <label className="text-xs font-medium mb-1 block text-gray-500">Score *</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={newExam.score}
                                onChange={e => setNewExam({ ...newExam, score: e.target.value })}
                                className={errors.score ? 'border-red-500' : ''}
                            />
                            {errors.score && <p className="text-xs text-red-500 mt-1">{errors.score}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block text-gray-500">Full Marks *</label>
                            <Input
                                type="number"
                                placeholder="360"
                                value={newExam.fullMarks}
                                onChange={e => setNewExam({ ...newExam, fullMarks: e.target.value })}
                                className={errors.fullMarks ? 'border-red-500' : ''}
                            />
                            {errors.fullMarks && <p className="text-xs text-red-500 mt-1">{errors.fullMarks}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block text-gray-500">Rank (Optional)</label>
                            <Input
                                type="number"
                                placeholder="AIR"
                                value={newExam.rank}
                                onChange={e => setNewExam({ ...newExam, rank: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block text-gray-500">Year</label>
                            <Input
                                type="number"
                                value={newExam.year}
                                onChange={e => setNewExam({ ...newExam, year: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={addScore} variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Add This Exam
                        </Button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                    <Button
                        onClick={() => mutation.mutate(scores)}
                        disabled={mutation.isPending || isSaved}
                        className={`transition-all min-w-[140px] ${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> :
                            isSaved ? <Check className="w-4 h-4 mr-2" /> :
                                <Save className="w-4 h-4 mr-2" />}
                        {mutation.isPending ? 'Saving...' : isSaved ? 'Saved' : 'Save All Exams'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
