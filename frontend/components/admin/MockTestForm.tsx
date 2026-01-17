'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface MockTestFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function MockTestForm({ initialData, isEdit }: MockTestFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: initialData || {
            title: '',
            slug: '',
            examType: 'nsat',
            duration: 60,
            totalMarks: 100,
            isFree: false,
            isPremium: true,
            sections: [{ name: 'General', questionCount: 10, marks: 10 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sections"
    });

    // Auto-generate slug from title
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
                await api.put(`/admin/nsat/mock-tests/${initialData._id}`, data);
                toast.success('Test updated successfully');
                router.push('/admin/nsat/mock-tests');
            } else {
                const res = await api.post('/admin/nsat/mock-tests', data);
                toast.success('Test created! Now add some questions.');
                // Redirect to question manager for the new test
                if (res.data?.data?._id) {
                    router.push(`/admin/nsat/mock-tests/${res.data.data._id}/questions`);
                } else {
                    router.push('/admin/nsat/mock-tests');
                }
            }
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
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Basic Details</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. NSAT General Mock 1" />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Slug</label>
                        <Input {...register('slug', { required: 'Slug is required' })} placeholder="e.g. nsat-general-mock-1" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Exam Type</label>
                        <select
                            {...register('examType')}
                            className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="nsat">NSAT General</option>
                            <option value="coding-nsat">Coding NSAT</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Duration (mins)</label>
                            <Input type="number" {...register('duration', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Total Marks</label>
                            <Input type="number" {...register('totalMarks', { valueAsNumber: true })} />
                        </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            className="w-full flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Brief description of the mock test..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register('isFree')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Is Free?</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register('isPremium')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Is Premium Only?</span>
                    </label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-900">Sections</h2>
                    <Button type="button" size="sm" onClick={() => append({ name: '', questionCount: 0, marks: 0 })} variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add Section
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-medium text-gray-500">Section Name</label>
                                <Input {...register(`sections.${index}.name` as const, { required: true })} placeholder="e.g. Logical Reasoning" />
                            </div>
                            <div className="w-24 space-y-2">
                                <label className="text-xs font-medium text-gray-500">Questions</label>
                                <Input type="number" {...register(`sections.${index}.questionCount` as const, { valueAsNumber: true })} />
                            </div>
                            <div className="w-24 space-y-2">
                                <label className="text-xs font-medium text-gray-500">Marks</label>
                                <Input type="number" {...register(`sections.${index}.marks` as const, { valueAsNumber: true })} />
                            </div>
                            <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                    {submitting ? 'Saving...' : (isEdit ? 'Update Test' : 'Create Test')}
                </Button>
            </div>
        </form>
    );
}
