// Basic icons as SVG components
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
)

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
)

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
)

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
)

const features = [
    {
        title: "Smart College Discovery",
        description: "Filters for fees, exams, location, and Score to find your perfect match instantly.",
        icon: SearchIcon,
        color: "bg-blue-100 text-blue-600"
    },
    {
        title: "Exam Timeline Tracking",
        description: "Never miss a registration deadline with our dedicated exam calendar and alerts.",
        icon: CalendarIcon,
        color: "bg-purple-100 text-purple-600"
    },
    {
        title: "PCM Prep Plans",
        description: "Get structured weekly Physics, Chemistry, and Math goals tailored to your pace.",
        icon: TargetIcon,
        color: "bg-pink-100 text-pink-600"
    },
    {
        title: "Save & Compare",
        description: "Build your personal shortlist and compare colleges side-by-side to decide better.",
        icon: HeartIcon,
        color: "bg-orange-100 text-orange-600"
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-white" id="features">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-wide mb-2">Platform Features</h2>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to crack admission.</p>
                    <p className="text-lg text-gray-600">REstart simplifies the chaotic process of engineering admissions with smart tools.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:bg-white transition-all duration-300 group">
                            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
