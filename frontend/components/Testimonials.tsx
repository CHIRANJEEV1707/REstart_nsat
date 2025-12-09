export default function Testimonials() {
    const testimonials = [
        {
            quote: "Helped me shortlist colleges in minutes. The specialized filters for PCM scores were a game changer.",
            author: "Aditya R.",
            role: "Class 12 Student",
            initial: "A",
            color: "bg-blue-500"
        },
        {
            quote: "The exam reminders saved my life. I almost missed the BITSAT registration deadline but REstart alerted me.",
            author: "Sneha K.",
            role: "Engineering Aspirant",
            initial: "S",
            color: "bg-indigo-500"
        },
        {
            quote: "Prep plan structure is amazing for PCM. It broke down my weekly syllabus into manageable chunks.",
            author: "Rahul M.",
            role: "Class 11 Student",
            initial: "R",
            color: "bg-purple-500"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built for Students, by Students.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col">
                            <div className="mb-6 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-xl`}>
                                    {t.initial}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{t.author}</div>
                                    <div className="text-sm text-gray-500">{t.role}</div>
                                </div>
                            </div>
                            <p className="text-lg text-gray-700 italic leading-relaxed">"{t.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
