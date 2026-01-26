"use client";

import { useState, useEffect } from "react";
import { Timer, X } from "lucide-react";

export function RepublicDayAlertBar() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        // Target: Jan 26, 2026 23:59:59
        const targetDate = new Date("2026-01-26T23:59:59");

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setIsVisible(false);
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 text-center py-2 px-4 relative">
            <div className="flex items-center justify-center gap-3 text-sm">
                <span className="font-bold text-gray-800">
                    🇮🇳 Happy Republic Day! Use code <span className="bg-white/80 px-2 py-0.5 rounded font-mono text-indigo-600">INDIA77</span> for 50% OFF
                </span>
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <Timer className="h-4 w-4" />
                    {timeLeft}
                </span>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Close"
            >
                <X className="h-4 w-4 text-gray-600" />
            </button>
        </div>
    );
}
