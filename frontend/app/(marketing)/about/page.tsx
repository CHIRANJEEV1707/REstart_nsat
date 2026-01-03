import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';

export const metadata: Metadata = {
    title: 'About REstart | Simplify Engineering Admissions',
    description: 'Learn about REstart\'s mission to help PCM students discover engineering colleges, track exams, and prepare with structured plans.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <BackButton />

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">About REstart</h1>

                {/* Hero Section */}
                <section className="mb-12">
                    <p className="text-xl text-gray-600 leading-relaxed">
                        REstart is the ultimate companion for PCM students navigating the complex world of engineering admissions. We simplify the journey from discovery to admission, offering tools to find the right colleges, track crucial exam timelines, and follow structured preparation plans.
                    </p>
                </section>

                {/* Mission Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To remove the chaos from engineering admissions. We believe every student deserves to make informed decisions backed by real data, smart filters, and clarity—not confusion. We empower PCM aspirants to take control of their future.
                    </p>
                </section>

                {/* What We Do Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                            <h3 className="font-semibold text-indigo-900 mb-2">Smart College Discovery</h3>
                            <p className="text-gray-600 text-sm">Find your fit with advanced filters for fees, exams accepted, location, and cutoff scores.</p>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                            <h3 className="font-semibold text-purple-900 mb-2">Exam Calendar & Alerts</h3>
                            <p className="text-gray-600 text-sm">Never miss a deadline. Track timelines for JEE, BITSAT, SRMJEEE, and state-level exams.</p>
                        </div>
                        <div className="p-6 bg-pink-50 rounded-xl border border-pink-100">
                            <h3 className="font-semibold text-pink-900 mb-2">Structure Prep Plans</h3>
                            <p className="text-gray-600 text-sm">Weekly Physics, Chemistry, and Math schedules to keep your preparation on track.</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Shortlist & Compare</h3>
                            <p className="text-gray-600 text-sm">Save your favorite colleges and build a personalized target list.</p>
                        </div>
                    </div>
                </section>

                {/* Built for Students Section */}
                <section className="mb-12">
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for Students, by Students</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We've been there. We know the stress of JEE mains, the confusion of counselling rounds, and the pressure of choosing the right path. REstart is designed by engineers who have lived through the process and want to make it better for the next generation. We understand your pain points because they were ours too.
                        </p>
                    </div>
                </section>

                {/* Who We Serve Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Serve</h2>
                    <p className="text-gray-600 leading-relaxed">
                        We serve Class 11 and 12 PCM students and engineering aspirants across India. Whether you are aiming for IITs, NITs, or top private universities, REstart provides the data and tools you need to succeed in national and state-level entrance exams.
                    </p>
                </section>
            </div>
        </div>
    );
}
