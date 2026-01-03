
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CollegePreview from "@/components/CollegePreview";
import Testimonials from "@/components/Testimonials";

import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Features />
      <CollegePreview />
      <Testimonials />
      <CTABanner />
    </main>
  );
}
