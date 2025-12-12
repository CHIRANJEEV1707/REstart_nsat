"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/Card";
import Link from 'next/link';
import { Globe, ArrowRight, MapPin, GraduationCap } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// Metadata for countries (Flag & Desc)
// We will match these by country name from the API
const countryMetadata: Record<string, { flag: string; desc: string }> = {
    "USA": { flag: "🇺🇸", desc: "Top tech & research universities" },
    "UK": { flag: "🇬🇧", desc: "Historic institutions & short degrees" },
    "Canada": { flag: "🇨🇦", desc: "Post-study work & immigration friendly" },
    "Australia": { flag: "🇦🇺", desc: "Quality education & lifestyle" },
    "Singapore": { flag: "🇸🇬", desc: "Global Asian hub for innovation" },
    "Switzerland": { flag: "🇨🇭", desc: "High-tech research & low tuition" },
    "Germany": { flag: "🇩🇪", desc: "Engineering power-house & free tuition" },
};

export default function InternationalLandingPage() {

    const { data: colleges = [], isLoading } = useQuery({
        queryKey: ['international-colleges'],
        queryFn: async () => {
            const res = await api.get('/international-colleges?limit=100'); // Get all to aggregate
            return res.data.data;
        }
    });

    // Aggregate data by country
    const countryStats = colleges.reduce((acc: any, col: any) => {
        const country = col.country;
        if (!acc[country]) {
            acc[country] = { count: 0, examples: [] };
        }
        acc[country].count += 1;
        if (acc[country].examples.length < 2) {
            acc[country].examples.push(col.name);
        }
        return acc;
    }, {});

    const countries = Object.keys(countryStats).map(name => ({
        name,
        count: countryStats[name].count,
        flag: countryMetadata[name]?.flag || "🌍",
        desc: countryMetadata[name]?.desc || "Explore opportunities worldwide",
        examples: countryStats[name].examples
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50 to-white opacity-50 -z-10"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 inline-flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Study Abroad
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Explore the World <br /> for <span className="text-indigo-600">Education</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Discover top universities across the globe, check visa requirements, and find your perfect international campus.
                    </p>
                </div>
            </div>

            {/* Countries Grid */}
            <div className="pb-24 px-6 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {countries.map((country) => (
                            <Link href={`/international/${country.name}`} key={country.name} className="group h-full">
                                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-gray-100 group-hover:-translate-y-2 overflow-hidden bg-white">
                                    <div className="h-2 bg-indigo-500 w-0 group-hover:w-full transition-all duration-500"></div>
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="text-6xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{country.flag}</div>
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{country.name}</h3>
                                        <p className="text-gray-500 text-sm mb-6 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg">
                                            {country.count} Top Universitie{country.count !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-gray-600 mb-6 leading-relaxed min-h-[48px]">{country.desc}</p>

                                        <div className="border-t border-gray-100 pt-4">
                                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Popular Campuses</p>
                                            <ul className="space-y-1">
                                                {country.examples.map((ex: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                                        <GraduationCap className="w-3 h-3 text-indigo-400" />
                                                        <span className="truncate">{ex}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Why Study Abroad Section */}
                <div className="mt-24 bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[2.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <MapPin className="w-96 h-96" />
                    </div>
                    <div className="relative z-10 max-w-3xl">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
                            <Globe className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Study Abroad?</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <ul className="space-y-4 text-indigo-100 text-lg">
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs">✓</span>
                                    Global networking opportunities
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs">✓</span>
                                    High-quality research infrastructure
                                </li>
                            </ul>
                            <ul className="space-y-4 text-indigo-100 text-lg">
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs">✓</span>
                                    Cultural exposure and personal growth
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs">✓</span>
                                    Access to global job markets
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
