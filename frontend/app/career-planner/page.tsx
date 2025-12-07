"use client"

import { motion } from 'framer-motion';
import { Brain, Target, Briefcase, TrendingUp, Lightbulb, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const careerPaths = [
  {
    title: 'Software Engineering',
    salary: '$95K - $150K',
    growth: 'High',
    education: "Bachelor's in Computer Science",
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Data Science',
    salary: '$100K - $160K',
    growth: 'Very High',
    education: "Bachelor's/Master's in Data Science",
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Product Management',
    salary: '$110K - $180K',
    growth: 'High',
    education: "Bachelor's in Business/Tech",
    icon: Target,
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'UX/UI Design',
    salary: '$80K - $130K',
    growth: 'High',
    education: "Bachelor's in Design",
    icon: Lightbulb,
    color: 'from-teal-500 to-green-500',
  },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Assessment',
    description: 'Take our comprehensive career assessment powered by AI to discover your strengths.',
  },
  {
    icon: Target,
    title: 'Personalized Roadmap',
    description: 'Get a customized career roadmap based on your goals and interests.',
  },
  {
    icon: MessageSquare,
    title: 'Expert Guidance',
    description: 'Connect with career counselors for personalized advice and mentorship.',
  },
  {
    icon: TrendingUp,
    title: 'Industry Insights',
    description: 'Stay updated with the latest trends and opportunities in your field.',
  },
];

export default function CareerPlannerPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Career Guidance</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-[var(--font-space-grotesk)]">
              Plan Your
              <br />
              <span className="text-primary">Dream Career</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover your ideal career path with AI-powered guidance and expert insights
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="glassmorphic border-2">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-[var(--font-space-grotesk)]">
                      Start Your Career Assessment
                    </h2>
                    <p className="text-muted-foreground">Answer a few questions to get personalized recommendations</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">What are your interests?</label>
                    <Input placeholder="e.g., Technology, Business, Arts..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">What are your strengths?</label>
                    <Input placeholder="e.g., Problem-solving, Communication..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">What are your career goals?</label>
                    <Textarea placeholder="Tell us about your aspirations..." rows={4} />
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Get AI Recommendations
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8 font-[var(--font-space-grotesk)]">
              Popular Career Paths
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerPaths.map((career, index) => (
                <motion.div
                  key={career.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center`}>
                          <career.icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="secondary">
                          Growth: {career.growth}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold mb-2 font-[var(--font-space-grotesk)]">
                        {career.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Salary Range</span>
                          <span className="font-semibold">{career.salary}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Education</span>
                          <span className="font-semibold text-right">{career.education}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        Learn More
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 font-[var(--font-space-grotesk)]">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="h-full text-center">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2 font-[var(--font-space-grotesk)]">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
