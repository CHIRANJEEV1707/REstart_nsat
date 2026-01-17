'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, Trash2, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

export default function QuestionManagerPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [expandedQ, setExpandedQ] = useState<string | null>(null);

    // Fetch Test Details (for context)
    const { data: test } = useQuery({
        queryKey: ['adminMockTest', id],
        queryFn: async () => (await api.get(`/admin/nsat/mock-tests/${id}`)).data.data
    });

    // Fetch Questions
    const { data: questions, isLoading } = useQuery({
        queryKey: ['adminQuestions', id],
        queryFn: async () => (await api.get(`/admin/nsat/mock-tests/${id}/questions`)).data.data
    });

    // Add Question Mutation
    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post(`/admin/nsat/mock-tests/${id}/questions`, data);
        },
        onSuccess: () => {
            toast.success('Question added successfully');
            setIsAdding(false);
            queryClient.invalidateQueries({ queryKey: ['adminQuestions', id] });
            reset();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add question')
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (qId: string) => {
            await api.delete(`/admin/nsat/questions/${qId}`);
        },
        onSuccess: () => {
            toast.success('Question deleted');
            queryClient.invalidateQueries({ queryKey: ['adminQuestions', id] });
        }
    });

    // Validations & Form
    const { register, control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            questionText: '',
            questionType: 'mcq',
            section: '',
            difficulty: 'medium',
            marks: 1,
            negativeMarks: 0.25,
            options: [
                { id: 'a', text: '' },
                { id: 'b', text: '' },
                { id: 'c', text: '' },
                { id: 'd', text: '' }
            ],
            correctAnswer: 'a',
            explanation: '',
            questionNumber: 0
        }
    });

    const { fields } = useFieldArray({ control, name: "options" });

    // Set default section from test loaded
    if (test && !watch('section') && test.sections.length > 0) {
        setValue('section', test.sections[0].name);
        setValue('marks', test.sections[0].marks / test.sections[0].questionCount); // approximate default
    }

    const onSubmit = (data: any) => {
        // Auto-increment question number
        const nextNum = (questions?.length || 0) + 1;
        addMutation.mutate({ ...data, questionNumber: nextNum });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Toaster position="top-right" />
            <div className="max-w-5xl mx-auto">
                <Link href="/admin/nsat/mock-tests" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Mock Tests
                </Link>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Manage Questions</h1>
                        <p className="text-gray-500">{test?.title} • {questions?.length || 0} Questions</p>
                    </div>
                    <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                        {isAdding ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Add Question</>}
                    </Button>
                </div>

                {isAdding && (
                    <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm mb-8 animate-in slide-in-from-top-4">
                        <h2 className="text-lg font-bold mb-4 text-blue-800">New Question Form</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Question Text</label>
                                <textarea {...register('questionText', { required: true })} className="w-full p-2 border rounded-md" rows={3} placeholder="Enter question description..." />
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Section</label>
                                    <select {...register('section')} className="w-full p-2 border rounded-md">
                                        {test?.sections.map((s: any) => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <select {...register('difficulty')} className="w-full p-2 border rounded-md">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Marks</label>
                                    <Input type="number" step="0.5" {...register('marks', { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Neg. Marks</label>
                                    <Input type="number" step="0.25" {...register('negativeMarks', { valueAsNumber: true })} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Options</label>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-center">
                                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg font-bold text-gray-600">
                                            {field.id.toUpperCase()}
                                        </div>
                                        <Input {...register(`options.${index}.text` as const, { required: true })} placeholder={`Option ${field.id.toUpperCase()}`} />
                                        <input
                                            type="radio"
                                            value={field.id}
                                            {...register('correctAnswer')}
                                            className="w-5 h-5 text-green-600"
                                            title="Mark as correct answer"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Explanation (Optional)</label>
                                <textarea {...register('explanation')} className="w-full p-2 border rounded-md" rows={2} placeholder="Explain why the answer is correct..." />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={addMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {addMutation.isPending ? 'Adding...' : 'Save Question'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    {questions?.map((q: any, idx: number) => (
                        <div key={q._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedQ(expandedQ === q._id ? null : q._id)}>
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 line-clamp-2">{q.questionText}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs">{q.section}</Badge>
                                        <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            Correct: <b className="ml-1 text-green-600 uppercase">{q.correctAnswer}</b>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {expandedQ === q._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete question?')) deleteMutation.mutate(q._id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {expandedQ === q._id && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 pl-16">
                                    <div className="space-y-2 mb-3">
                                        {q.options.map((opt: any) => (
                                            <div key={opt.id} className={`flex items-center gap-2 text-sm ${opt.id === q.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                                <span className="w-6 font-bold uppercase">{opt.id}.</span>
                                                {opt.text}
                                                {opt.id === q.correctAnswer && <CheckCircle className="w-4 h-4" />}
                                            </div>
                                        ))}
                                    </div>
                                    {q.explanation && (
                                        <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <span className="font-bold">Explanation:</span> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {questions?.length === 0 && !isAdding && (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                            No questions added yet. Click "Add Question" to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
