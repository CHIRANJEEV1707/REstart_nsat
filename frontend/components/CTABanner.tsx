import Link from 'next/link';

export default function CTABanner() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start your engineering journey?</h2>
                        <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Join thousands of students using REstart to find their dream college and crack their exams.
                        </p>
                        <Link
                            href="/explore"
                            className="inline-block bg-white text-indigo-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg"
                        >
                            Explore Colleges Now
                        </Link>
                    </div>

                    {/* abstract circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
            </div>
        </section>
    );
}
