import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Bell, Info, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AlertsProps {
    alerts: any[];
}

export function AlertsCard({ alerts }: AlertsProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Bell size={20} />
                    </div>
                    <CardTitle className="text-lg">Insights & Alerts</CardTitle>
                </div>

                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            {getIcon(alert.type)}
                            <div>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="#" className="mt-4 block text-center text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                    View All Activity
                </Link>
            </CardContent>
        </Card>
    );
}
