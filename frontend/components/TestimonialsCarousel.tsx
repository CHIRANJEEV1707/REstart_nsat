'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

interface Testimonial {
    id: number;
    quote: string;
    author: string;
    role: string;
    initial: string;
    color: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        quote: "Helped me shortlist colleges in minutes. The specialized filters for PCM scores were a game changer.",
        author: "Aditya R.",
        role: "Class 12 Student",
        initial: "A",
        color: "bg-blue-500"
    },
    {
        id: 2,
        quote: "The exam reminders saved my life. I almost missed the BITSAT registration deadline but REstart alerted me.",
        author: "Sneha K.",
        role: "Engineering Aspirant",
        initial: "S",
        color: "bg-indigo-500"
    },
    {
        id: 3,
        quote: "Prep plan structure is amazing for PCM. It broke down my weekly syllabus into manageable chunks.",
        author: "Rahul M.",
        role: "Class 11 Student",
        initial: "R",
        color: "bg-purple-500"
    },
    {
        id: 4,
        quote: "Finding colleges based on my JEE Main rank was so confusing until I used the REstart cutoff predictor.",
        author: "Vikram S.",
        role: "Dropper",
        initial: "V",
        color: "bg-green-500"
    },
    {
        id: 5,
        quote: "I love the comparison feature. Putting three colleges side-by-side made the decision so much easier for my parents.",
        author: "Ananya P.",
        role: "Class 12 Student",
        initial: "A",
        color: "bg-pink-500"
    },
    {
        id: 6,
        quote: "Finally, a platform that understands us. No clutter, just pure data about fees and placements.",
        author: "Karthik J.",
        role: "JEE Aspirant",
        initial: "K",
        color: "bg-yellow-500"
    },
    {
        id: 7,
        quote: "The Chemistry prep schedule helped me cover Organic Chemistry in just 2 months. Highly recommended!",
        author: "Neha G.",
        role: "Class 11 Student",
        initial: "N",
        color: "bg-red-500"
    },
    {
        id: 8,
        quote: "Checking eligibility for state exams was a nightmare. REstart listed everything clearly for my state.",
        author: "Rohan D.",
        role: "Class 12 Student",
        initial: "R",
        color: "bg-teal-500"
    },
    {
        id: 9,
        quote: "The 'Drop Year' guide gave me the confidence to take a gap year and prepare for IIT again.",
        author: "Priya M.",
        role: "Dropper",
        initial: "P",
        color: "bg-orange-500"
    },
    {
        id: 10,
        quote: "User interface is beautiful and so fast. I don't get distracted by ads like on other sites.",
        author: "Arjun L.",
        role: "Engineering Aspirant",
        initial: "A",
        color: "bg-cyan-500"
    },
    {
        id: 11,
        quote: "I found a great college in my budget that I didn't even know existed. Thank you REstart!",
        author: "Meera S.",
        role: "Class 12 Student",
        initial: "M",
        color: "bg-rose-500"
    },
    {
        id: 12,
        quote: "Physics formulas and weekly targets keep me disciplined. It's like having a personal mentor.",
        author: "Varun B.",
        role: "Class 11 Student",
        initial: "V",
        color: "bg-violet-500"
    }
];

export default function TestimonialsCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true }, [
        AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })
    ]);

    return (
        <div className="relative">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-8 py-8"> {/* Negative margin to offset padding */}
                    {TESTIMONIALS.map((t) => (
                        <div key={t.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-8 min-w-0">
                            <div className="h-full p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                                        {t.initial}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{t.author}</div>
                                        <div className="text-sm text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-700 italic leading-relaxed">"{t.quote}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
