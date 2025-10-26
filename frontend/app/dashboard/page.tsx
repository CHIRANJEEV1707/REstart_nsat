"use client"

import { motion } from 'framer-motion';
import { BookMarked, TrendingUp, Calendar, Award, Settings, Bell, Heart, FileText } from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const savedColleges = [
  {
    id: 1,
    name: 'MIT',
    location: 'Cambridge, MA',
    status: 'Application Pending',
    deadline: '2024-12-15',
  },
  {
    id: 2,
    name: 'Stanford University',
    location: 'Stanford, CA',
    status: 'Saved',
    deadline: '2024-12-20',
  },
  {
    id: 3,
    name: 'Harvard University',
    location: 'Cambridge, MA',
    status: 'Application Submitted',
    deadline: '2024-12-10',
  },
];

const upcomingExams = [
  { name: 'SAT', date: '2024-11-15', status: 'Registered' },
  { name: 'TOEFL', date: '2024-11-22', status: 'Pending' },
];

const achievements = [
  { icon: Award, title: 'Profile Complete', description: 'Completed your profile 100%' },
  { icon: BookMarked, title: 'First College Saved', description: 'Saved your first college' },
  { icon: TrendingUp, title: 'Career Path Selected', description: 'Completed career assessment' },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold font-[var(--font-space-grotesk)]">
                  Welcome back, <span className="text-gradient">John</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Here's an overview of your college journey
                </p>
              </div>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">{savedColleges.length}</div>
                  <div className="text-sm text-muted-foreground">Saved Colleges</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">2</div>
                  <div className="text-sm text-muted-foreground">Applications</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">{upcomingExams.length}</div>
                  <div className="text-sm text-muted-foreground">Exams Scheduled</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">{achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-[var(--font-space-grotesk)]">Saved Colleges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedColleges.map((college) => (
                      <div
                        key={college.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <div className="font-semibold">{college.name}</div>
                          <div className="text-sm text-muted-foreground">{college.location}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              college.status === 'Application Submitted'
                                ? 'default'
                                : college.status === 'Application Pending'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {college.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground">Due: {college.deadline}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="font-[var(--font-space-grotesk)]">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full transition-all" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Personal Info</span>
                        <span className="font-semibold text-green-600">Complete</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Academic Details</span>
                        <span className="font-semibold text-green-600">Complete</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Test Scores</span>
                        <span className="font-semibold text-yellow-600">Pending</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Essays</span>
                        <span className="font-semibold text-yellow-600">In Progress</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-[var(--font-space-grotesk)]">Upcoming Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingExams.map((exam, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{exam.name}</div>
                            <div className="text-sm text-muted-foreground">{exam.date}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{exam.status}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      View All Exams
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-[var(--font-space-grotesk)]">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <achievement.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
