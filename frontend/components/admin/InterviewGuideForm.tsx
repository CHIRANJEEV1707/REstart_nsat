'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface InterviewGuideFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function InterviewGuideForm({ initialData, isEdit }: InterviewGuideFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: initialData || {
            title: '',
            slug: '',
            guideType: 'nsat',
            description: '',
            content: '',
            isFree: false,
            isLimited: true,
            tips: [''],
            sampleQuestions: [{ question: '', suggestedAnswer: '' }]
        }
    });

    const { fields: tipsFields, append: appendTip, remove: removeTip } = useFieldArray({
        control,
        name: "tips" as any
    });

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "sampleQuestions"
    });

    // Auto-generate slug
    const title = watch('title');
    useEffect(() => {
        if (!isEdit && title) {
            setValue('slug', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, isEdit, setValue]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put(`/admin/nsat/interview-guides/${initialData._id}`, data);
                toast.success('Guide updated successfully');
            } else {
                await api.post('/admin/nsat/interview-guides', data);
                toast.success('Guide created successfully');
            }
            router.push('/admin/nsat/interview-guides');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Guide Details</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. System Design Basics" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <Input {...register('slug', { required: 'Slug is required' })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Guide Type</label>
                        <select {...register('guideType')} className="w-full p-2 border rounded-md">
                            <option value="nsat">NSAT / Behavioral</option>
                            <option value="coding">Coding / Technical</option>
                        </select>
                    </div>

                    <div className="flex gap-6 items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('isFree')} className="w-4 h-4" />
                            <span className="text-sm font-medium">Is Free?</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('isLimited')} className="w-4 h-4" />
                            <span className="text-sm font-medium">Has Limited Preview?</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea {...register('description')} className="w-full p-2 border rounded-md" rows={3} placeholder="Brief summary of the guide..." />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Content (Markdown)</label>
                    <textarea {...register('content')} className="w-full p-2 border rounded-md font-mono text-sm" rows={15} placeholder="# Introduction\n\nWrite your guide content here using Markdown..." />
                    <p className="text-xs text-gray-500">Supports basic Markdown formatting.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Expert Tips */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold">Expert Tips</h3>
                        <Button type="button" size="sm" onClick={() => appendTip('')} variant="outline">
                            <Plus className="w-3 h-3 mr-1" /> Add Tip
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {tipsFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <Input {...register(`tips.${index}` as const)} placeholder={`Tip ${index + 1}`} />
                                <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeTip(index)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sample Questions */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold">Sample Questions</h3>
                        <Button type="button" size="sm" onClick={() => appendQuestion({ question: '', suggestedAnswer: '' })} variant="outline">
                            <Plus className="w-3 h-3 mr-1" /> Add Q&A
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {questionFields.map((field, index) => (
                            <div key={field.id} className="bg-gray-50 p-3 rounded-lg space-y-2 relative group">
                                <Button type="button" size="sm" variant="ghost" className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100" onClick={() => removeQuestion(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Input {...register(`sampleQuestions.${index}.question` as const)} placeholder="Question" className="font-medium" />
                                <textarea {...register(`sampleQuestions.${index}.suggestedAnswer` as const)} className="w-full p-2 border rounded-md text-sm" rows={2} placeholder="Suggested Answer Strategy..." />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]">
                    {submitting ? 'Saving...' : (isEdit ? 'Update Guide' : 'Create Guide')}
                </Button>
            </div>
        </form>
    );
}
