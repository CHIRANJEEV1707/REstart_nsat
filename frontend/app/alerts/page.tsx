"use client";

import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/Card";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface Alert {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    message: string;
    date: string;
}

export default function AlertsPage() {
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['alerts'],
        queryFn: async () => (await api.get('/alerts')).data.data
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-amber-500" />;
            case 'error': return <AlertTriangle className="text-red-500" />;
            case 'success': return <CheckCircle className="text-green-500" />;
            default: return <Info className="text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-50 border-amber-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'success': return 'bg-green-50 border-green-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-32 px-6 pb-20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-500">Stay updated with deadlines and recommendations</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts?.map((alert: Alert) => (
                            <Card key={alert.id} className={`border ${getBgColor(alert.type)}`}>
                                <CardContent className="p-6 flex gap-4 items-start">
                                    <div className="mt-1">{getIcon(alert.type)}</div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-lg mb-1">{alert.message}</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                                            {new Date(alert.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
