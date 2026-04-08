import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p
                    className="text-sm text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    © 2026 REstart. Built for NSAT aspirants.
                </p>
                <div
                    className="flex items-center gap-4 text-sm text-gray-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    <Link href="/privacy" className="hover:text-gray-600 transition-colors">
                        Privacy Policy
                    </Link>
                    <span className="text-gray-200">|</span>
                    <Link href="/terms" className="hover:text-gray-600 transition-colors">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
