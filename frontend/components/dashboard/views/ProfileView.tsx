"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { User, MapPin, Mail, Calendar, GraduationCap, Globe, DollarSign, BookOpen, Plus, X, Save, Edit2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/Skeleton";
import toast from 'react-hot-toast';

// Options
const TARGET_DEGREES = ["B.Tech", "B.E.", "B.Sc", "B.Des", "B.Arch", "MBBS", "BBA", "Other"];
const COLLEGE_TYPES = ["Engineering", "Medical", "Management", "Design", "Research", "Arts & Science"];
const PREFERRED_COUNTRIES = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Ireland", "New Zealand"];
const EXAM_OPTIONS = ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SAT", "TOEFL", "IELTS", "NEET", "MHTCET", "WBJEE", "COMEDK", "Other"];

export function ProfileView() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // Fetch User Data
    const { data: userRes, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/auth/me');
            return res.data;
        }
    });

    const user = userRes?.data;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        state: '',
        city: '',
        country: '',
        class_level: '',
        target_degree: '',
        college_type_aspiring: [] as string[],
        preferred_countries: [] as string[],
        exam_scores: [] as { exam: string, score: string }[],
        budgetINR: { min: 0, max: 0 },
        interestedExams: [] as string[]
    });

    // Initialize form when user data loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                state: user.state || '',
                city: user.city || '',
                country: user.country || 'India',
                class_level: user.class_level || '',
                target_degree: user.target_degree || '',
                college_type_aspiring: user.college_type_aspiring || [],
                preferred_countries: user.preferred_countries || [],
                exam_scores: user.exam_scores || [],
                budgetINR: user.preferences?.budgetINR || user.budget_range || user.preferences?.budgetUSD || { min: 0, max: 0 },
                interestedExams: user.interestedExams || user.target_exams || []
            });
        }
    }, [user]);

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await api.put('/auth/updatedetails', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        },
        onError: (error: any) => {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    });

    const handleSave = () => {
        // Backend expects budgetUSD, interestedExams
        updateProfileMutation.mutate(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form
        if (user) {
            setFormData({
                name: user.name || '',
                state: user.state || '',
                city: user.city || '',
                country: user.country || 'India',
                class_level: user.class_level || '',
                target_degree: user.target_degree || '',
                college_type_aspiring: user.college_type_aspiring || [],
                preferred_countries: user.preferred_countries || [],
                exam_scores: user.exam_scores || [],
                budgetINR: user.preferences?.budgetINR || user.budget_range || user.preferences?.budgetUSD || { min: 0, max: 0 },
                interestedExams: user.interestedExams || user.target_exams || []
            });
        }
    };

    // Helpers for Arrays
    const toggleArrayItem = (field: 'college_type_aspiring' | 'preferred_countries', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    // Helper for Exams
    const addExam = () => {
        setFormData(prev => ({
            ...prev,
            exam_scores: [...prev.exam_scores, { exam: '', score: '' }]
        }));
    };

    const removeExam = (index: number) => {
        setFormData(prev => ({
            ...prev,
            exam_scores: prev.exam_scores.filter((_, i) => i !== index)
        }));
    };

    const updateExam = (index: number, field: 'exam' | 'score', value: string) => {
        setFormData(prev => {
            const updated = [...prev.exam_scores];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, exam_scores: updated };
        });
    };

    if (isLoading) return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-20 fade-in slide-in-from-bottom-2 duration-500 animate-in">

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                        <Edit2 size={16} /> Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                            <Save size={16} /> Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Core Identity */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border-gray-100 overflow-hidden">
                        <div className="bg-indigo-600 h-24 w-full"></div>
                        <CardContent className="pt-0 text-center -mt-12 relative px-4 pb-6">
                            <div className="w-24 h-24 rounded-full bg-white p-1 mx-auto mb-3 shadow-md">
                                <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                    {formData.name?.[0]?.toUpperCase()}
                                </div>
                            </div>

                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-center font-bold text-lg mb-1"
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                            )}

                            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

                            {!isEditing && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {formData.target_degree && (
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                                            {formData.target_degree}
                                        </Badge>
                                    )}
                                    {formData.country && (
                                        <Badge variant="outline">
                                            {formData.country}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Summary (Read Only mainly) */}
                    <Card className="shadow-sm border-gray-100">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Shortlisted Colleges</span>
                                <span className="font-bold text-gray-900">{user?.saved_colleges?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Exams Added</span>
                                <span className="font-bold text-gray-900">{user?.exam_scores?.length || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Location & Background */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="text-indigo-500 w-5 h-5" />
                                Location & Background
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                {isEditing ? (
                                    <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="e.g. Mumbai" />
                                ) : (
                                    <p className="p-2 bg-gray-50 rounded-md text-gray-900">{formData.city || "Not Set"}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">State</label>
                                {isEditing ? (
                                    <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="e.g. Maharashtra" />
                                ) : (
                                    <p className="p-2 bg-gray-50 rounded-md text-gray-900">{formData.state || "Not Set"}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                {isEditing ? (
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    >
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                        <option value="UK">UK</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="p-2 bg-gray-50 rounded-md text-gray-900">{formData.country || "Not Set"}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Current Class/Status</label>
                                {isEditing ? (
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.class_level}
                                        onChange={e => setFormData({ ...formData, class_level: e.target.value })}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="11th">Class 11</option>
                                        <option value="12th">Class 12</option>
                                        <option value="Dropper">Dropper</option>
                                        <option value="College Student">College Student</option>
                                    </select>
                                ) : (
                                    <p className="p-2 bg-gray-50 rounded-md text-gray-900">{formData.class_level || "Not Set"}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Academic Preferences */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GraduationCap className="text-indigo-500 w-5 h-5" />
                                Academic Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Target Degree</label>
                                    {isEditing ? (
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.target_degree}
                                            onChange={e => setFormData({ ...formData, target_degree: e.target.value })}
                                        >
                                            <option value="">Select Degree</option>
                                            {TARGET_DEGREES.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                                        </select>
                                    ) : (
                                        <p className="p-2 bg-gray-50 rounded-md text-gray-900">{formData.target_degree || "Not Set"}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Budget Range (Annual INR)</label>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    type="number" placeholder="Min"
                                                    value={formData.budgetINR?.min || ''}
                                                    onChange={e => setFormData({ ...formData, budgetINR: { ...formData.budgetINR, min: Number(e.target.value) } })}
                                                />
                                                <span className="text-gray-400">-</span>
                                                <Input
                                                    type="number" placeholder="Max"
                                                    value={formData.budgetINR?.max || ''}
                                                    onChange={e => setFormData({ ...formData, budgetINR: { ...formData.budgetINR, max: Number(e.target.value) } })}
                                                />
                                            </>
                                        ) : (
                                            <p className="p-2 bg-gray-50 rounded-md text-gray-900 w-full">
                                                {formData.budgetINR?.min ? `₹${formData.budgetINR.min} - ₹${formData.budgetINR.max}` : "Not Set"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Aspiring College Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLLEGE_TYPES.map(type => {
                                        const isSelected = formData.college_type_aspiring.includes(type);
                                        return (
                                            <button
                                                key={type}
                                                disabled={!isEditing}
                                                onClick={() => toggleArrayItem('college_type_aspiring', type)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${isSelected
                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                                                    }`}
                                            >
                                                {type} {isSelected && isEditing && <X size={12} className="inline ml-1" />}
                                                {!isSelected && isEditing && <Plus size={12} className="inline ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Study Destinations</label>
                                <div className="flex flex-wrap gap-2">
                                    {PREFERRED_COUNTRIES.map(country => {
                                        const isSelected = formData.preferred_countries.includes(country);
                                        return (
                                            <button
                                                key={country}
                                                disabled={!isEditing}
                                                onClick={() => toggleArrayItem('preferred_countries', country)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${isSelected
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200'
                                                    }`}
                                            >
                                                {country} {isSelected && isEditing && <X size={12} className="inline ml-1" />}
                                                {!isSelected && isEditing && <Plus size={12} className="inline ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* 3. Exam Scores */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="text-indigo-500 w-5 h-5" />
                                Exam Scores
                            </CardTitle>
                            {isEditing && (
                                <Button size="sm" variant="ghost" className="text-indigo-600" onClick={addExam}>
                                    <Plus size={16} className="mr-1" /> Add Exam
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {formData.exam_scores.length === 0 && (
                                <p className="text-gray-400 text-sm italic text-center py-4">No exam scores added yet.</p>
                            )}

                            {formData.exam_scores.map((score, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={score.exam}
                                                onChange={e => updateExam(index, 'exam', e.target.value)}
                                            >
                                                <option value="">Select Exam</option>
                                                {EXAM_OPTIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                            </select>
                                        ) : (
                                            <span className="font-bold text-gray-900 block">{score.exam || 'Unknown Exam'}</span>
                                        )}
                                    </div>
                                    <div className="w-32">
                                        {isEditing ? (
                                            <Input
                                                placeholder="Score"
                                                value={score.score}
                                                onChange={e => updateExam(index, 'score', e.target.value)}
                                            />
                                        ) : (
                                            <span className="text-gray-600 font-mono bg-white px-2 py-1 rounded inline-block text-sm border border-gray-200">
                                                {score.score}
                                            </span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeExam(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                                Save Profile
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
