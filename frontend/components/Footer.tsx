import Link from 'next/link';
import NextImage from 'next/image';


// SVG Replacements for social icons
const LinkedInIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
const YoutubeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>


export default function Footer() {
    return (
        <footer className="pt-20 pb-10 bg-gray-900 border-t border-gray-800 text-gray-400">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="block mb-6">
                            <NextImage
                                src="/Restart_logo.png"
                                alt="REstart Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            Helping PCM students discover their dream engineering colleges and crack the exams that matter.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors"><LinkedInIcon /></a>
                            <a href="#" className="hover:text-white transition-colors"><InstagramIcon /></a>
                            <a href="#" className="hover:text-white transition-colors"><YoutubeIcon /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/colleges" className="hover:text-indigo-400 transition-colors">Colleges</Link></li>
                            <li><Link href="/exams" className="hover:text-indigo-400 transition-colors">Exams</Link></li>
                            <li><Link href="/prep" className="hover:text-indigo-400 transition-colors">Prep Plans</Link></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                            <li><Link href="/help" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                            <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center text-xs">
                    © {new Date().getFullYear()} REstart. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
