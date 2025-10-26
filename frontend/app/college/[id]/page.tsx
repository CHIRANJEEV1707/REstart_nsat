"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Globe, Calendar, GraduationCap, Check, Heart, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { toast } from "react-hot-toast";

type College = {
  id: number;
  name: string;
  city: string;
  state: string;
  website_url: string;
  logo_url: string | null;
  established_year: number;
  rating: number;
  fees_min: number;
  fees_max: number;
  overview: string;
  is_saved?: boolean;
  degrees: Array<{ id: number; name: string }>;
  exams: Array<{ id: number; name: string; code: string }>;
  important_dates: Array<{
    id: number;
    type: string;
    date: string;
    description: string;
  }>;
};

export default function CollegeDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const overviewRef = useRef<HTMLDivElement>(null);
  const feesRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  
  const { data: college, isLoading, error } = useQuery({
    queryKey: ["college", id],
    queryFn: async () => {
      const response = await api.get(`/colleges/${id}/`);
      return response.data;
    },
  });

  const handleSaveCollege = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save colleges");
      return;
    }
    
    try {
      await api.post("/saved/", { college: id });
      toast.success("College saved to your list");
    } catch (error) {
      toast.error("Failed to save college");
      console.error(error);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-muted rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Failed to load college details</h1>
          <p className="text-muted-foreground mb-6">There was an error retrieving the college information.</p>
          <Link href="/discover">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/discover">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </Link>
        </div>

        {/* College Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="w-full md:w-24 h-24 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
            {college.logo_url ? (
              <img 
                src={college.logo_url} 
                alt={college.name} 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <GraduationCap className="h-12 w-12 text-primary/30" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{college.name}</h1>
                <div className="flex items-center text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{college.city}, {college.state}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  <a 
                    href={college.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {college.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-md">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">{college.rating.toFixed(1)}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleSaveCollege}
                >
                  <Heart className={`h-4 w-4 ${college.is_saved ? "fill-destructive text-destructive" : ""}`} />
                  {college.is_saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Established</h3>
            <p className="text-xl font-semibold">{college.established_year}</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Fee Range</h3>
            <p className="text-xl font-semibold">₹{college.fees_min.toLocaleString()} - ₹{college.fees_max.toLocaleString()}</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Degrees</h3>
            <p className="text-xl font-semibold">{college.degrees?.length || 0}</p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Accepts Exams</h3>
            <p className="text-xl font-semibold">{college.exams?.length || 0}</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <motion.div 
              ref={overviewRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.h2 
                className="text-2xl font-bold mb-4"
                variants={fadeInUp}
              >
                Overview
              </motion.h2>
              
              <motion.div 
                className="prose dark:prose-invert max-w-none"
                variants={fadeInUp}
              >
                <p>{college.overview}</p>
              </motion.div>
            </motion.div>

            {/* Degrees Section */}
            <motion.div
              ref={feesRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.h2 
                className="text-2xl font-bold mb-4"
                variants={fadeInUp}
              >
                Degrees Offered
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={fadeInUp}
              >
                {college.degrees?.map((degree: { id: number; name: string }) => (
                  <div 
                    key={degree.id}
                    className="bg-card border border-border rounded-md p-3 flex items-center gap-3"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <span>{degree.name}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Important Dates */}
            <motion.div
              ref={datesRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.h2 
                className="text-2xl font-bold mb-4"
                variants={fadeInUp}
              >
                Important Dates
              </motion.h2>
              
              <motion.div variants={fadeInUp}>
                {college.important_dates?.length > 0 ? (
                  <div className="space-y-3">
                    {college.important_dates.map((date: { id: number; type: string; date: string; description: string }) => (
                      <div 
                        key={date.id}
                        className="bg-card border border-border rounded-md p-4 flex gap-4"
                      >
                        <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">{date.type}</h3>
                          <p className="text-sm text-muted-foreground mb-1">{new Date(date.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm">{date.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No important dates available at this time.</p>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exams Accepted */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Exams Accepted</h2>
              
              {college.exams?.length > 0 ? (
                <div className="space-y-3">
                  {college.exams.map((exam: { id: number; name: string; code: string }) => (
                    <Link 
                      key={exam.id}
                      href={`/exams/${exam.code}`}
                      className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors"
                    >
                      <span>{exam.name}</span>
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">{exam.code}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No exam information available.</p>
              )}
            </Card>

            {/* How to Get In */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">How to Get In</h2>
              
              <ul className="space-y-3">
                {[
                  "Check eligibility criteria",
                  "Prepare for entrance exams",
                  "Submit application before deadline",
                  "Prepare for interviews (if applicable)",
                  "Check scholarship opportunities"
                ].map((step, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-primary/10 rounded-full p-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}