"use client"

import { motion } from 'framer-motion';
import { Search, Target, BookOpen, Award, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Search,
    title: 'Smart College Discovery',
    description: 'Find the perfect college match based on your preferences, budget, and career goals.',
    color: 'from-purple-500 to-blue-500',
  },
  {
    icon: Target,
    title: 'Career Planning',
    description: 'AI-powered career guidance to help you make informed decisions about your future.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BookOpen,
    title: 'Exam Preparation',
    description: 'Stay updated with exam dates, eligibility criteria, and registration details.',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Award,
    title: 'Scholarship Finder',
    description: 'Discover scholarships and financial aid opportunities tailored to your profile.',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your college application journey and stay on top of deadlines.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Verified Information',
    description: 'Access accurate, up-to-date college information from trusted sources.',
    color: 'from-emerald-500 to-purple-500',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-[var(--font-space-grotesk)]">
            Everything You Need to
            <br />
            <span className="text-gradient">Plan Your Future</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and resources to guide you through every step of your college journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-[var(--font-space-grotesk)]">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
