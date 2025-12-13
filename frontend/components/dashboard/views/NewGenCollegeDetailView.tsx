"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Heart, Share2, MapPin, Clock, Calendar, Briefcase, Code, Terminal, Zap, ChevronRight, X, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { College } from "@/types/college";

interface NewGenCollegeDetailViewProps {
    collegeId: string;
    onBack: () => void;
}

import api from "@/lib/axios";

// ... existing imports ...

export default function NewGenCollegeDetailView({ collegeId, onBack }: NewGenCollegeDetailViewProps) {
    // In a real app, useQuery to fetch details by ID. 
    // For now, we might assume we have data or fetch it. 
    // Mocking the college data structure for the specific layout requirements if wait is needed,
    // but ideally we fetch.
    const [college, setCollege] = useState<College | null>(null);
    const [loading, setLoading] = useState(true);

    // Simulate fetch logic
    useEffect(() => {
        // Fetch logic would go here
        // For demonstration, we'll simulate a fetch
        const fetchCollege = async () => {
            try {
                // Replace with actual API call
                const response = await api.get(`/newgen-colleges/${collegeId}`);
                if (response.data.success) {
                    setCollege(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch college", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollege();
    }, [collegeId]);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading program details...</div>;
    if (!college) return <div className="p-8 text-center text-red-400">Program not found.</div>;

    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 font-sans pb-24 absolute top-0 left-0 w-full z-20">
            {/* 1. Sticky Top Bar */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-lg text-white truncate max-w-[200px] md:max-w-md">
                        {college.name}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-pink-500 transition-colors">
                        <Heart size={20} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors hidden md:block">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* 2. Hero Section */}
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent z-10" />

                {college.image && (college.image.startsWith('http') || college.image.startsWith('/')) ? (
                    <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <span className="text-6xl font-bold text-slate-800">{college.name[0]}</span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/10">
                                NEW-GEN
                            </span>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                                INDUSTRY-LED
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                            Learn by building. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                Pay after placement.
                            </span>
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-8 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-400" />
                                {college.location.city}, {college.location.state}
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase size={18} className="text-indigo-400" />
                                On-Campus
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-indigo-400" />
                                4 Years
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button className="bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 h-12 rounded-full">
                                Explore Curriculum
                            </Button>
                            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 h-12 rounded-full px-8">
                                Check Eligibility
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-20">

                {/* 3. Key Differentiators */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Briefcase, title: "Placement-First", desc: "Designed backwards from JD" },
                            { icon: Zap, title: "Live Projects", desc: "No boring theory exams" },
                            { icon: Code, title: "Top Tech Stack", desc: "MERN, AI/ML, System Design" },
                            { icon: Terminal, title: "Industry Mentors", desc: "Learn from FAANG engineers" }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Program Structure */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Program Structure</h2>
                            <p className="text-slate-400">B.Tech in Computer Science & AI (Residential)</p>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-slate-800 ml-3 md:ml-6 space-y-12 pb-4">
                        {[
                            { year: "Year 1", title: "Fundamentals & Logic", desc: "Python, DSA, Web Basics. Build 20+ mini projects." },
                            { year: "Year 2", title: "Full Stack & System Design", desc: "MERN Stack, SQL/NoSQL, Low-Level Design. 6-month Internship." },
                            { year: "Year 3", title: "Specialization & AI", desc: "Choose AI/ML, DevOps, or Blockchain. Deep dive into Scalability." },
                            { year: "Year 4", title: "Placement Track", desc: "Mock Interviews, Resume building, Final year Capstone project." }
                        ].map((item, i) => (
                            <div key={i} className="relative pl-8 md:pl-12">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                                <span className="text-indigo-400 font-mono text-sm font-bold tracking-wider mb-2 block">{item.year}</span>
                                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Fees & ROI */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                        <h2 className="text-3xl font-bold text-white mb-6">Investment & ROI</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-indigo-500/10">
                                <span className="text-slate-300">Tuition Model</span>
                                <span className="text-white font-bold text-right">Pay After Placement / <br /> Income Share Agreement</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-indigo-500/10">
                                <span className="text-slate-300">Min. Guarantee</span>
                                <span className="text-emerald-400 font-bold">₹ 6 - 10 LPA</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-indigo-500/10">
                                <span className="text-slate-300">Avg. CTC (Last Batch)</span>
                                <span className="text-white font-bold">₹ 18.5 LPA</span>
                            </div>
                        </div>
                        <div className="mt-8 text-xs text-slate-500 leading-relaxed">
                            * Terms and conditions apply. Income share is capped at a maximum amount.
                            Placement assurance depends on clearing internal assessments.
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Who is this for?</h2>
                        <ul className="space-y-4">
                            {[
                                "You want to build real-world software, not just memorize theory.",
                                "You are ambitious and willing to work 10-12 hours a day.",
                                "You aim for product-based companies (Uber, Amazon, Cred).",
                                "You value skills over traditional degree labels."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                                    <span className="text-slate-300 text-lg">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 6. Comparison Table */}
                <section className="py-8">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                        <div className="grid grid-cols-3 bg-slate-950 p-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
                            <div>Feature</div>
                            <div>Traditional College</div>
                            <div className="text-indigo-400">New-Gen Tech School</div>
                        </div>
                        {[
                            { feat: "Learning", trad: "Theory & Exams", new: "Live Projects & Code" },
                            { feat: "Teachers", trad: "Academicians", new: "Tech Leads from Industry" },
                            { feat: "Curriculum", trad: "Updated every 4-5 yrs", new: "Updated every 6 months" },
                            { feat: "Placement", trad: "Mass Recruiters (3-5 LPA)", new: "Product Companies (10+ LPA)" },
                            { feat: "Model", trad: "Upfront Fees", new: "ROI / Outcome Based" }
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-3 p-6 border-t border-slate-800 text-base">
                                <div className="text-slate-300 font-medium">{row.feat}</div>
                                <div className="text-slate-500">{row.trad}</div>
                                <div className="text-white font-bold">{row.new}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* 7. Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 p-4 md:px-12 z-50 flex items-center justify-between">
                <div className="hidden md:block">
                    <p className="text-white font-bold text-lg">Admissions Open!</p>
                    <p className="text-slate-400 text-xs text-green-400">Next batch starts Aug 2025</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-10 md:h-12 rounded-xl">
                        <Download size={18} className="mr-2" /> Brochure
                    </Button>
                    <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 md:h-12 px-8 rounded-xl">
                        Apply Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
