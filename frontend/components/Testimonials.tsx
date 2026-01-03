import TestimonialsCarousel from './TestimonialsCarousel';

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

                <div className="px-4">
                    <TestimonialsCarousel />
                </div>
            </div>
        </section>
    );
}
