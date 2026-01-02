import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
                            Find the Right <span className="text-primary">Engineering College</span> — Without the Chaos.
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Your all-in-one platform to explore colleges, check eligibility, view exam timelines, and get structured PCM prep plans.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href="/explore"
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all transform hover:-translate-y-1"
                            >
                                Start Exploring
                            </Link>
                            <Link
                                href="/exams"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
                            >
                                View Exams
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                        {/* Abstract Tech/Education Illustration Representation */}
                        <div className="relative aspect-square rounded-3xl bg-gradient-to-tr from-primary/10 to-blue-50 border border-primary/5 p-8 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between animate-pulse-slow">
                                    <div className="h-2 w-12 bg-primary/10 rounded-full"></div>
                                    <div className="space-y-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/80"></div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                                        <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-primary rounded-2xl shadow-xl p-4 flex flex-col justify-end translate-y-8">
                                    <div className="text-white font-bold text-2xl mb-1">98%</div>
                                    <div className="text-white/80 text-sm">Match Rate</div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 col-span-2 mt-4 flex items-center justify-between border border-blue-100">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white"></div>
                                        ))}
                                    </div>
                                    <div className="text-primary font-semibold text-sm">Join 10k+ Students</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
