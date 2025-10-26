"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useAnimation } from "framer-motion";
import { ArrowRight, Search, BookOpen, Award, GraduationCap, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const controls = useAnimation();

  // Scroll animations with GSAP
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Animate stats counting up
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        gsap.from(".stat-number", {
          textContent: 0,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          stagger: 0.2,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        });
      }

      // Animate features on scroll
      if (featuresRef.current) {
        gsap.from(".feature-card", {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 70%",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Text reveal animation for hero heading
  useEffect(() => {
    if (heroTextRef.current) {
      const text = heroTextRef.current;
      const originalText = text.innerText;
      text.innerHTML = "";

      for (let i = 0; i < originalText.length; i++) {
        const span = document.createElement("span");
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
        span.style.display = "inline-block";
        span.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
        span.style.transitionDelay = `${i * 0.03}s`;
        span.innerText = originalText[i] === " " ? "\u00A0" : originalText[i];
        text.appendChild(span);
      }

      setTimeout(() => {
        const spans = text.querySelectorAll("span");
        spans.forEach(span => {
          span.style.opacity = "1";
          span.style.transform = "translateY(0)";
        });
      }, 100);
    }
  }, []);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        
        <div className="container mx-auto px-4 z-10 py-20">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <h1 
              ref={heroTextRef}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            >
              Find Your Perfect College Journey
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8"
              variants={fadeInUp}
            >
              Discover colleges, prepare for exams, and plan your future with personalized guidance.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <Link href="/discover">
                <Button size="lg" className="group">
                  Explore Colleges
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <Button variant="outline" size="lg">
                  Sign Up Free
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Floating college cards */}
          <div className="relative mt-16 hidden md:block">
            <motion.div 
              className="absolute -left-4 top-0 w-64 h-40 bg-card border border-border rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="h-20 bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-primary/50" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm">IIT Delhi</h3>
                <p className="text-xs text-muted-foreground">Engineering Excellence</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute right-10 top-10 w-64 h-40 bg-card border border-border rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="h-20 bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary/50" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm">AIIMS Delhi</h3>
                <p className="text-xs text-muted-foreground">Medical Sciences</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border" ref={statsRef}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Colleges" },
              { value: "50+", label: "Exams" },
              { value: "10k+", label: "Students" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="stat-number text-4xl font-bold text-primary mb-2">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How REstart Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our platform simplifies your college search and preparation journey with powerful tools and personalized guidance.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Discover Colleges",
                description: "Find colleges that match your preferences, budget, and academic goals."
              },
              {
                icon: BookOpen,
                title: "Exam Preparation",
                description: "Get detailed information about entrance exams and structured preparation plans."
              },
              {
                icon: Award,
                title: "Application Guidance",
                description: "Step-by-step guidance for applications, scholarships, and important dates."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="feature-card bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your College Journey Made Simple</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Follow these simple steps to find and apply to your dream college.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border hidden md:block"></div>

            {/* Timeline steps */}
            <div className="space-y-24">
              {[
                {
                  icon: Users,
                  title: "Create Your Profile",
                  description: "Sign up and tell us about your academic interests, budget, and preferences.",
                  align: "left"
                },
                {
                  icon: Search,
                  title: "Discover Colleges",
                  description: "Browse through our extensive database of colleges filtered to match your criteria.",
                  align: "right"
                },
                {
                  icon: Calendar,
                  title: "Track Important Dates",
                  description: "Never miss application deadlines, exam dates, or other important milestones.",
                  align: "left"
                },
                {
                  icon: GraduationCap,
                  title: "Apply with Confidence",
                  description: "Get guidance through each step of the application process for your chosen colleges.",
                  align: "right"
                },
              ].map((step, index) => (
                <div key={index} className="relative flex md:items-center">
                  <motion.div 
                    className={`flex items-center md:w-1/2 ${step.align === 'right' ? 'md:ml-auto' : ''}`}
                    initial={{ opacity: 0, x: step.align === 'left' ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={`bg-card border border-border rounded-lg p-6 ${step.align === 'right' ? 'md:mr-10' : 'md:ml-10'} w-full`}>
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary hidden md:flex items-center justify-center">
                    <div className="w-3 h-3 bg-background rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of students who found their perfect college match with REstart.</p>
            
            <Link href="/discover">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
