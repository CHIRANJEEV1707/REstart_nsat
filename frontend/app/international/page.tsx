"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/Card";
import Link from 'next/link';
import { Globe } from "lucide-react";

const activeCountries = [
    { name: "USA", count: "250+ Colleges", flag: "🇺🇸", desc: "Top tech & research universities" },
    { name: "UK", count: "120+ Colleges", flag: "🇬🇧", desc: "Historic institutions & short degrees" },
    { name: "Canada", count: "80+ Colleges", flag: "🇨🇦", desc: "Post-study work & immigration friendly" },
    { name: "Australia", count: "50+ Colleges", flag: "🇦🇺", desc: "Quality education & lifestyle" },
];

export default function InternationalLandingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">Study Abroad</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Explore the World for Education</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover top universities across the globe, check visa requirements, and find your perfect international campus.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeCountries.map((country) => (
                        <Link href={`/international/${country.name}`} key={country.name} className="group">
                            <Card className="h-full hover:shadow-xl transition-all border-gray-200 group-hover:-translate-y-2">
                                <CardContent className="p-8 text-center">
                                    <div className="text-6xl mb-6">{country.flag}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{country.name}</h3>
                                    <p className="text-indigo-600 font-medium mb-4">{country.count}</p>
                                    <p className="text-gray-500 text-sm">{country.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 bg-indigo-900 rounded-3xl p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <Globe className="w-12 h-12 mb-6 text-indigo-300" />
                        <h2 className="text-3xl font-bold mb-4">Why Study Abroad?</h2>
                        <ul className="space-y-3 mb-8 text-indigo-100">
                            <li className="flex items-center gap-3">✓ Global networking opportunities</li>
                            <li className="flex items-center gap-3">✓ High-quality research infrastructure</li>
                            <li className="flex items-center gap-3">✓ Cultural exposure and personal growth</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
