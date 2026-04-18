"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { BookOpen, ClipboardList, Trophy, Sparkles, Calendar, ArrowRight, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MockScore {
    testName: string;
    score: number;
    maxScore: number;
    takenAt: string;
}

interface NextSession {
    topic: string;
    sessionDate: string;
    whatsappLink: string;
}

interface QotdOption {
    id: string;
    text: string;
}

interface QuestionOfTheDay {
    questionText: string;
    options: QotdOption[];
    correctAnswer: string;
    explanation: string;
    difficulty: string;
    subject: string | null;
    section: string;
}

interface DashboardData {
    totalQuestionsAttempted: number;
    mockScores: MockScore[];
    nextSession: NextSession | null;
    questionOfTheDay: QuestionOfTheDay | null;
}

function getGreeting(name: string): string {
    const hour = new Date().getHours();
    const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    return `Good ${period}, ${name?.split(" ")[0] || "there"}`;
}

function formatSessionDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

const OPTION_LABELS = ["A", "B", "C", "D"];

const difficultyBadgeClass: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
};

function QotdCard({ qotd }: { qotd: QuestionOfTheDay }) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);

    const handleSelect = (optionId: string) => {
        if (revealed) return;
        setSelectedAnswer(optionId);
        setRevealed(true);
    };

    const getOptionClass = (optionId: string): string => {
        if (!revealed) {
            return "border-gray-200 bg-white text-gray-800 hover:border-[#0085ff]/30 hover:bg-[rgba(0,133,255,0.04)] cursor-pointer";
        }
        if (optionId.toLowerCase() === qotd.correctAnswer.toLowerCase()) {
            return "border-green-400 bg-green-50 text-green-700 cursor-default";
        }
        if (selectedAnswer && optionId.toLowerCase() === selectedAnswer.toLowerCase()) {
            return "border-red-400 bg-red-50 text-red-700 cursor-default";
        }
        return "border-gray-200 bg-white text-gray-400 cursor-default";
    };

    return (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0085ff] shrink-0" />
                    <h2 className="text-base font-bold text-gray-900">Question of the Day</h2>
                </div>
                <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        difficultyBadgeClass[qotd.difficulty] ?? "bg-gray-100 text-gray-600"
                    }`}
                >
                    {qotd.difficulty}
                </span>
            </div>

            {/* Question text */}
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {qotd.questionText}
            </p>

            {/* Options */}
            <div className="space-y-2">
                {qotd.options.map((option, idx) => (
                    <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        disabled={revealed}
                        className={`w-full flex items-start gap-3 px-4 py-3 rounded-full border text-sm text-left transition-all ${getOptionClass(option.id)}`}
                    >
                        <span className="shrink-0 font-bold w-4">{OPTION_LABELS[idx] ?? option.id}.</span>
                        <span className="flex-1">{option.text}</span>
                    </button>
                ))}
            </div>

            {/* Explanation */}
            {revealed && qotd.explanation && (
                <div className="bg-white/60 border rounded-xl px-4 py-3" style={{ borderColor: 'rgba(0,133,255,0.12)' }}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{qotd.explanation}</p>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-1.5 pt-1">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">New question every day</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user && !user.onboardingCompleted) {
            router.replace("/onboarding");
        }
    }, [user, router]);

    const { data: dashboard, isLoading, isError } = useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await api.get("/dashboard");
            return res.data.data;
        },
        enabled: !!user,
        retry: 2,
        refetchOnWindowFocus: true,
    });

    if (isLoading || !user) {
        return (
            <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8 pb-24">
                <div className="h-9 w-72 bg-gray-100 animate-pulse rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl" style={{ background: 'rgba(0,133,255,0.06)' }} />
                    ))}
                </div>
                <div className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col items-center justify-center gap-4 pb-24">
                <p className="text-gray-600 text-lg">Failed to load dashboard.</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
                    className="px-4 py-2 bg-[#0085ff] hover:bg-[#0070d9] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const mockScores = dashboard?.mockScores ?? [];
    const totalQuestionsAttempted = dashboard?.totalQuestionsAttempted ?? 0;
    const nextSession = dashboard?.nextSession ?? null;
    const questionOfTheDay = dashboard?.questionOfTheDay ?? null;

    const bestScore =
        mockScores.length > 0
            ? Math.max(...mockScores.map((m) => Math.round((m.score / m.maxScore) * 100)))
            : null;

    const isPremium = (user?.purchasedBundles?.length ?? 0) > 0;

    return (
        <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto w-full space-y-10 pb-24 animate-fade-in-up">

            {/* ── Section 1: Greeting + Progress Snapshot ── */}
            <div className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    {getGreeting(user.name)}
                </h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,133,255,0.08)', border: '1px solid rgba(0,133,255,0.12)' }}>
                            <BookOpen className="w-5 h-5 text-[#0085ff]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                Questions Attempted
                            </p>
                            <p className="text-2xl font-bold text-gray-900 tabular-nums">
                                {totalQuestionsAttempted.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,133,255,0.08)', border: '1px solid rgba(0,133,255,0.12)' }}>
                            <ClipboardList className="w-5 h-5 text-[#0085ff]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                Mock Tests Taken
                            </p>
                            <p className="text-2xl font-bold text-gray-900 tabular-nums">
                                {mockScores.length}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,133,255,0.08)', border: '1px solid rgba(0,133,255,0.12)' }}>
                            <Trophy className="w-5 h-5 text-[#0085ff]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                Best Mock Score
                            </p>
                            <p className="text-2xl font-bold text-gray-900 tabular-nums">
                                {bestScore !== null ? `${bestScore}%` : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Score Trend */}
                <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Mock Results</h3>
                    {mockScores.length === 0 ? (
                        <div className="py-6 text-center">
                            <p className="text-sm text-gray-500">No mock tests taken yet.</p>
                            <Link
                                href="/prep/nsat/mock-tests"
                                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-[#0085ff] hover:underline"
                            >
                                Start your first mock <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {mockScores.slice(0, 5).map((m, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <span className="text-gray-700 truncate max-w-[60%]">{m.testName}</span>
                                    <span className="font-semibold text-gray-900 tabular-nums shrink-0">
                                        {m.score}/{m.maxScore}
                                        <span className="text-gray-400 font-normal ml-1.5">
                                            ({Math.round((m.score / m.maxScore) * 100)}%)
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ── Section 2: Question of the Day ── */}
            {questionOfTheDay ? (
                <QotdCard qotd={questionOfTheDay} />
            ) : (
                <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-[#0085ff]" />
                        <h2 className="text-base font-bold text-gray-900">Question of the Day</h2>
                    </div>
                    <p className="text-sm text-[#0085ff]">Coming soon — check back tomorrow!</p>
                </div>
            )}

            {/* ── Section 3: Upcoming Session ── */}
            {nextSession ? (
                <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                    <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,133,255,0.08)' }}>
                            <Calendar className="w-5 h-5 text-[#0085ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                                Upcoming Session
                            </p>
                            <h2 className="text-base font-bold text-gray-900 capitalize">
                                {nextSession.topic.replace(/-/g, " ")}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatSessionDate(nextSession.sessionDate)}
                            </p>
                        </div>
                        <Link
                            href={nextSession.whatsappLink}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
                        >
                            Join WhatsApp Group <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            ) : isPremium ? (
                <div className="rounded-2xl p-6 flex items-center justify-between gap-4" style={{ background: 'white', border: '1px solid rgba(0,133,255,0.18)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,133,255,0.10)' }}>
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,133,255,0.08)' }}>
                            <Calendar className="w-5 h-5 text-[#0085ff]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                No upcoming sessions scheduled
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Book a slot whenever you're ready.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/sessions"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0085ff] hover:bg-[#0070d9] text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
                    >
                        Book a Session <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            ) : (
                <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0085ff 0%, #0060cc 100%)', boxShadow: '0 8px 32px rgba(0,133,255,0.25)' }}>
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h2 className="text-lg font-bold">Unlock Live Sessions</h2>
                            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                Get 1-on-1 mentorship, interview prep, and live doubt-clearing.
                            </p>
                        </div>
                        <Link
                            href="/checkout"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0085ff] hover:bg-blue-50 text-sm font-bold rounded-xl transition-colors shrink-0"
                        >
                            Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}
