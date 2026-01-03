"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, Search, ExternalLink, Calendar } from 'lucide-react';

interface Exam {
    _id: string;
    name: string;
    code: string;
    description: string;
    dates: {
        registration_start: string;
        registration_end: string;
        exam_date_start: string;
    };
    website: string;
}

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/exams');
                setExams(res.data.data);
            } catch (error) {
                console.error("Failed to fetch exams", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Entrance Exams
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Stay updated with important dates and details.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Card key={exam._id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{exam.name}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {exam.code}
                                    </span>
                                </div>
                                <p className="text-gray-500 mb-6 line-clamp-3 text-sm">
                                    {exam.description}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar size={16} className="mr-2 text-indigo-500" />
                                        <span>Exam: {new Date(exam.dates.exam_date_start).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <a
                                    href={exam.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Visit Website <ExternalLink size={14} className="ml-1" />
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
