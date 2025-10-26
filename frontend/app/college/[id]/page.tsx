"use client"

import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Star, Award, BookOpen, Calendar, DollarSign, ExternalLink, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const collegeData: Record<string, any> = {
  '1': {
    name: 'Massachusetts Institute of Technology',
    location: 'Cambridge',
    state: 'Massachusetts',
    rating: 4.8,
    students: 11520,
    image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg',
    type: 'Private',
    established: 1861,
    accreditation: 'NEASC',
    tuitionFee: '$53,790',
    description: 'MIT is a world-renowned institution known for its cutting-edge research and innovation in science, engineering, and technology. The institute combines rigorous academics with hands-on learning experiences.',
    courses: [
      'Computer Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Physics',
      'Mathematics',
      'Biology',
      'Economics',
      'Chemical Engineering',
    ],
    facilities: [
      'State-of-the-art Research Labs',
      'Modern Library System',
      'Sports Complex',
      'Student Housing',
      'Innovation Centers',
      'Dining Halls',
    ],
    reviews: [
      {
        name: 'Sarah Johnson',
        rating: 5,
        date: '2024-01-15',
        comment: 'Outstanding research opportunities and world-class faculty. The collaborative environment pushes you to excel.',
      },
      {
        name: 'Michael Chen',
        rating: 5,
        date: '2024-01-10',
        comment: 'The best decision I made for my career. Amazing resources and networking opportunities.',
      },
    ],
  },
};

export default function CollegePage({ params }: { params: { id: string } }) {
  const college = collegeData[params.id] || collegeData['1'];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="relative h-96 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500"
            style={{
              backgroundImage: `url(${college.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
            <div>
              <Link href="/discover">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Discover
                </Button>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="bg-white/90 text-foreground">{college.type}</Badge>
                  <Badge variant="secondary">Established {college.established}</Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-[var(--font-space-grotesk)] text-white drop-shadow-lg">
                  {college.name}
                </h1>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{college.location}, {college.state}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-1 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{college.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1" />
                    <span>{college.students.toLocaleString()} students</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-bold mb-4 font-[var(--font-space-grotesk)]">
                          About {college.name}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {college.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4 font-[var(--font-space-grotesk)]">
                          Key Highlights
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Award className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <div className="font-semibold">Accreditation</div>
                              <div className="text-sm text-muted-foreground">{college.accreditation}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <div className="font-semibold">Established</div>
                              <div className="text-sm text-muted-foreground">{college.established}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Users className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <div className="font-semibold">Total Students</div>
                              <div className="text-sm text-muted-foreground">{college.students.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <DollarSign className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <div className="font-semibold">Annual Tuition</div>
                              <div className="text-sm text-muted-foreground">{college.tuitionFee}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="courses">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 font-[var(--font-space-grotesk)]">
                        Popular Courses
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {college.courses.map((course: string) => (
                          <div
                            key={course}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span>{course}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="facilities">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 font-[var(--font-space-grotesk)]">
                        Campus Facilities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {college.facilities.map((facility: string) => (
                          <div
                            key={facility}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span>{facility}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-4">
                    {college.reviews.map((review: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold">{review.name}</div>
                              <div className="text-sm text-muted-foreground">{review.date}</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-2">{college.tuitionFee}</div>
                  <div className="text-sm text-muted-foreground mb-6">Annual Tuition Fee</div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="mr-2 h-4 w-4" />
                      Save College
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Need Help?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get personalized guidance from our experts
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Advisor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
