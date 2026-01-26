"use client";

import { useEffect, useState } from "react";
import { X, Timer, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";

export function RepublicDayBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Target: Jan 26, 2026 23:59:59
        const targetDate = new Date("2026-01-26T23:59:59");

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft("Offer Expired");
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("INDIA77");
        toast.success("Coupon code copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-green-50 p-4 sm:p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500 group">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-orange-100 opacity-50 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-green-100 opacity-50 blur-xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">
                            🇮🇳 Republic Day Special
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 animate-pulse">
                            <Timer className="h-3 w-3" />
                            Ends in: {timeLeft}
                        </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Get <span className="text-orange-600">50% OFF</span> on all Premium Plans
                    </h3>
                    <p className="text-sm text-gray-600 max-w-xl">
                        Celebrate the spirit of India with unrestricted access to all mock tests, detailed analysis, and expert guidance. Use code:
                        <button
                            onClick={handleCopy}
                            className="ml-2 inline-flex items-center gap-1.5 font-mono font-bold bg-white hover:bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-indigo-600 cursor-pointer transition-colors"
                            title="Click to copy"
                        >
                            INDIA77
                            {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
                        </button>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link href="/prep/nsat" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md border-0">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Claim Offer
                        </Button>
                    </Link>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
                        aria-label="Dismiss banner"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
