import { Card, CardContent } from "@/components/ui/Card";
import { Calendar } from "lucide-react";

export function MiniCalendar() {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate dates for the current week starting today
    const currentWeek = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return {
            date: d.getDate(),
            day: days[d.getDay()],
            isToday: i === 0
        };
    });

    return (
        <Card className="bg-white border-gray-100 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                    <Calendar size={18} className="text-indigo-600" />
                    <span>Your Schedule</span>
                </div>

                {/* Mini Week View */}
                <div className="flex justify-between mb-6">
                    {currentWeek.map((item, i) => (
                        <div key={i} className={`flex flex-col items-center p-2 rounded-lg ${item.isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <span className="text-[10px] uppercase font-medium mb-1">{item.day}</span>
                            <span className={`text-sm font-bold ${item.isToday ? 'text-white' : 'text-gray-900'}`}>{item.date}</span>
                        </div>
                    ))}
                </div>

                {/* Upcoming Events Placeholder */}
                <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-xs font-bold text-amber-700 mb-1">JEE Main Reg Closing</p>
                        <p className="text-[10px] text-amber-600">Tomorrow, 11:59 PM</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg opacity-60">
                        <div className="flex flex-col items-center py-2">
                            <span className="text-xs font-medium text-blue-400">No other deadlines</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
