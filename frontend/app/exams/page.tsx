"use client"

import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, ExternalLink, Bell } from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const exams = [
  {
    id: 1,
    name: 'SAT',
    fullName: 'Scholastic Assessment Test',
    date: 'Multiple dates available',
    registrationDeadline: 'Rolling basis',
    eligibility: 'High school students',
    category: 'Undergraduate',
    difficulty: 'Moderate',
    duration: '3 hours',
    description: 'Standardized test widely used for college admissions in the United States.',
    sections: ['Reading', 'Writing and Language', 'Math'],
    totalMarks: 1600,
    website: 'https://www.collegeboard.org/sat',
  },
  {
    id: 2,
    name: 'ACT',
    fullName: 'American College Testing',
    date: 'Multiple dates available',
    registrationDeadline: 'Rolling basis',
    eligibility: 'High school students',
    category: 'Undergraduate',
    difficulty: 'Moderate',
    duration: '3 hours 35 minutes',
    description: 'Standardized test for college admissions, emphasizing curriculum-based knowledge.',
    sections: ['English', 'Math', 'Reading', 'Science', 'Writing (Optional)'],
    totalMarks: 36,
    website: 'https://www.act.org',
  },
  {
    id: 3,
    name: 'GRE',
    fullName: 'Graduate Record Examination',
    date: 'Year-round',
    registrationDeadline: 'Rolling basis',
    eligibility: 'Graduate school applicants',
    category: 'Graduate',
    difficulty: 'Advanced',
    duration: '3 hours 45 minutes',
    description: 'Standardized test for graduate school admissions worldwide.',
    sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
    totalMarks: 340,
    website: 'https://www.ets.org/gre',
  },
  {
    id: 4,
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    date: 'Year-round',
    registrationDeadline: 'Rolling basis',
    eligibility: 'MBA/Business school applicants',
    category: 'Graduate',
    difficulty: 'Advanced',
    duration: '3 hours 30 minutes',
    description: 'Standardized test for admission to business schools and MBA programs.',
    sections: ['Analytical Writing', 'Integrated Reasoning', 'Quantitative', 'Verbal'],
    totalMarks: 800,
    website: 'https://www.mba.com/gmat',
  },
  {
    id: 5,
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    date: 'Multiple dates available',
    registrationDeadline: 'Rolling basis',
    eligibility: 'Non-native English speakers',
    category: 'Language',
    difficulty: 'Moderate',
    duration: '3 hours',
    description: 'English proficiency test for international students applying to English-speaking universities.',
    sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
    totalMarks: 120,
    website: 'https://www.ets.org/toefl',
  },
  {
    id: 6,
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    date: 'Multiple dates available',
    registrationDeadline: 'Rolling basis',
    eligibility: 'Non-native English speakers',
    category: 'Language',
    difficulty: 'Moderate',
    duration: '2 hours 45 minutes',
    description: 'English proficiency test accepted by universities and organizations worldwide.',
    sections: ['Listening', 'Reading', 'Writing', 'Speaking'],
    totalMarks: 9,
    website: 'https://www.ielts.org',
  },
];

const categories = ['All', 'Undergraduate', 'Graduate', 'Language'];

export default function ExamsPage() {
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-[var(--font-space-grotesk)]">
              Exam
              <br />
              <span className="text-primary">Information Center</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with exam dates, eligibility, and registration details
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <Button key={category} variant="outline" className="rounded-full">
                {category}
              </Button>
            ))}
          </motion.div>

          <div className="space-y-6">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-2xl font-bold font-[var(--font-space-grotesk)]">
                                {exam.name}
                              </h3>
                              <Badge variant="secondary">{exam.category}</Badge>
                            </div>
                            <p className="text-muted-foreground">{exam.fullName}</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4">{exam.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold">Exam Date</div>
                              <div className="text-sm text-muted-foreground">{exam.date}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold">Duration</div>
                              <div className="text-sm text-muted-foreground">{exam.duration}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold">Total Marks</div>
                              <div className="text-sm text-muted-foreground">{exam.totalMarks}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold">Registration</div>
                              <div className="text-sm text-muted-foreground">{exam.registrationDeadline}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-semibold mb-2">Sections</div>
                          <div className="flex flex-wrap gap-2">
                            {exam.sections.map((section) => (
                              <Badge key={section} variant="outline">
                                {section}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-semibold">Eligibility:</span>{' '}
                          <span className="text-muted-foreground">{exam.eligibility}</span>
                        </div>
                      </div>

                      <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <div className="text-sm text-muted-foreground mb-2">Difficulty</div>
                          <Badge className="text-base">{exam.difficulty}</Badge>
                        </div>

                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Bell className="mr-2 h-4 w-4" />
                          Set Reminder
                        </Button>

                        <Button variant="outline" className="w-full" asChild>
                          <a href={exam.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Official Website
                          </a>
                        </Button>

                        <Button variant="outline" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          Download Guide
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
