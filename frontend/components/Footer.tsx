import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer 
            className="relative z-0 overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #e8f3ff 25%, #99caff 60%, #0085FF 100%)' }}
        >
            <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-5 flex flex-col items-start">
                        <Link href="/" className="block">
                            <Image 
                                src="/images/REstart_dark.svg" 
                                alt="REstart Logo" 
                                width={400} 
                                height={120} 
                                className="h-32 md:h-40 w-auto object-contain -ml-4 md:-ml-6 -mt-8 md:-mt-[44px] -mb-8 md:-mb-10" 
                            />
                        </Link>
                        <p className="text-[#003f88] text-sm leading-relaxed max-w-sm mb-8 font-medium">
                            The ultimate discovery and preparation platform. Built exclusively for NSAT aspirants to help you crack the exam and find your dream college.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/50 border border-[rgba(0,80,180,0.3)] shadow-sm flex items-center justify-center text-[#0055bb] hover:border-[#0055bb] hover:bg-[#0055bb] hover:text-white transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/50 border border-[rgba(0,80,180,0.3)] shadow-sm flex items-center justify-center text-[#0055bb] hover:border-[#0055bb] hover:bg-[#0055bb] hover:text-white transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/50 border border-[rgba(0,80,180,0.3)] shadow-sm flex items-center justify-center text-[#0055bb] hover:border-[#0055bb] hover:bg-[#0055bb] hover:text-white transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="mailto:contact@letsrestart.in" className="w-10 h-10 rounded-full bg-white/50 border border-[rgba(0,80,180,0.3)] shadow-sm flex items-center justify-center text-[#0055bb] hover:border-[#0055bb] hover:bg-[#0055bb] hover:text-white transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1 md:col-span-2 md:col-start-7">
                        <h4 className="text-[#003f88] font-semibold mb-6 uppercase tracking-wider text-xs">Product</h4>
                        <ul className="space-y-4 text-sm font-medium text-[rgba(0,50,120,0.75)]">
                            <li><Link href="#features" className="hover:text-[#003f88] transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-[#003f88] transition-colors">Pricing</Link></li>
                            <li><Link href="#testimonials" className="hover:text-[#003f88] transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-[#003f88] font-semibold mb-6 uppercase tracking-wider text-xs">Support</h4>
                        <ul className="space-y-4 text-sm font-medium text-[rgba(0,50,120,0.75)]">
                            <li><Link href="#" className="hover:text-[#003f88] transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-[#003f88] transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-[#003f88] transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-[#003f88] font-semibold mb-6 uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium text-[rgba(0,50,120,0.75)]">
                            <li><Link href="/privacy" className="hover:text-[#003f88] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#003f88] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="hover:text-[#003f88] transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Border & Copyright */}
                <div className="pt-8 border-t border-[rgba(0,80,180,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[#ffffff] font-medium tracking-wide">
                        © 2026 REstart. All rights reserved.
                    </p>
                    <p className="text-sm text-[#ffffff] font-medium">
                        Built with <span className="animate-pulse">♥</span> for aspirants
                    </p>
                </div>
            </div>
        </footer>
    );
}
