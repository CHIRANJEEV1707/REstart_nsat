"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Colleges</h1>
            <p className="text-lg text-gray-600 mb-8">Discover top colleges and universities tailored to your preferences.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                <Link href="/indian-colleges" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Indian Colleges</h2>
                    <p className="text-gray-500">Explore premier institutes across India including IITs, NITs, and more.</p>
                </Link>
                <Link href="/international/universities" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-2">International Universities</h2>
                    <p className="text-gray-500">Find your dream university abroad with our comprehensive global database.</p>
                </Link>
            </div>
        </div>
    );
}
