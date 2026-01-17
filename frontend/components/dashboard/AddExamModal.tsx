'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Check, Loader2, X } from 'lucide-react';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface AddExamModalProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddExamModal({ children, open, onOpenChange }: AddExamModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [trackedExams, setTrackedExams] = useState<string[]>([]);
    const queryClient = useQueryClient();

    // Sync external open state if provided
    const show = open !== undefined ? open : isOpen;
    const setShow = onOpenChange || setIsOpen;

    // Fetch already tracked exams on open
    useEffect(() => {
        if (show) {
            api.get('/user/exams').then(res => {
                if (res.data.success) {
                    setTrackedExams(res.data.data.map((e: any) => e._id));
                }
            });
            // Reset search
            setSearch('');
            setResults([]);
        }
    }, [show]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.trim().length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await api.get(`/exams?search=${encodeURIComponent(search)}`);
                if (res.data.success) {
                    setResults(res.data.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const toggleExam = async (examId: string, currentStatus: boolean) => {
        // Optimistic update
        const newTracked = currentStatus
            ? trackedExams.filter(id => id !== examId)
            : [...trackedExams, examId];

        setTrackedExams(newTracked);

        try {
            if (currentStatus) {
                await api.delete('/user/exams', { data: { examId } });
                toast.success('Exam removed from deadlines');
            } else {
                await api.post('/user/exams', { examId });
                toast.success('Exam added to deadlines');
            }
            // Invalidate dashboard to update deadlines
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        } catch (error) {
            console.error("Failed to update exam", error);
            toast.error("Failed to update exam");
            // Revert on error
            setTrackedExams(trackedExams);
        }
    };

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Exams to Track</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search exams (e.g. JEE, NEET)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
                        {loading && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            </div>
                        )}

                        {!loading && search.length >= 2 && results.length === 0 && (
                            <p className="text-center text-gray-500 py-8 text-sm">No exams found.</p>
                        )}

                        {!loading && search.length < 2 && (
                            <p className="text-center text-gray-400 py-8 text-sm">Type to search for exams...</p>
                        )}

                        {!loading && results.map((exam) => {
                            const isTracked = trackedExams.includes(exam._id);
                            return (
                                <div key={exam._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">{exam.name}</p>
                                        <p className="text-xs text-gray-500">{exam.code}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isTracked ? "outline" : "default"}
                                        className={isTracked ? "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                                        onClick={() => toggleExam(exam._id, isTracked)}
                                    >
                                        {isTracked ? (
                                            <>
                                                <Check className="h-4 w-4 mr-1" /> Added
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-1" /> Add
                                            </>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
