"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { CollegeCard } from '@/components/shared/college-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockColleges = [
  {
    id: '1',
    name: 'Massachusetts Institute of Technology',
    location: 'Cambridge',
    state: 'Massachusetts',
    rating: 4.8,
    students: 11520,
    image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg',
    type: 'Private',
    featured: true,
  },
  {
    id: '2',
    name: 'Stanford University',
    location: 'Stanford',
    state: 'California',
    rating: 4.7,
    students: 17249,
    image: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg',
    type: 'Private',
    featured: true,
  },
  {
    id: '3',
    name: 'University of California, Berkeley',
    location: 'Berkeley',
    state: 'California',
    rating: 4.6,
    students: 45057,
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg',
    type: 'Public',
  },
  {
    id: '4',
    name: 'Harvard University',
    location: 'Cambridge',
    state: 'Massachusetts',
    rating: 4.9,
    students: 31655,
    image: 'https://images.pexels.com/photos/1552212/pexels-photo-1552212.jpeg',
    type: 'Private',
    featured: true,
  },
  {
    id: '5',
    name: 'Carnegie Mellon University',
    location: 'Pittsburgh',
    state: 'Pennsylvania',
    rating: 4.5,
    students: 15818,
    image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
    type: 'Private',
  },
  {
    id: '6',
    name: 'Georgia Institute of Technology',
    location: 'Atlanta',
    state: 'Georgia',
    rating: 4.4,
    students: 45296,
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg',
    type: 'Public',
  },
  {
    id: '7',
    name: 'University of Illinois Urbana-Champaign',
    location: 'Urbana',
    state: 'Illinois',
    rating: 4.3,
    students: 56607,
    image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg',
    type: 'Public',
  },
  {
    id: '8',
    name: 'Cornell University',
    location: 'Ithaca',
    state: 'New York',
    rating: 4.5,
    students: 25593,
    image: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg',
    type: 'Private',
  },
  {
    id: '9',
    name: 'University of Michigan',
    location: 'Ann Arbor',
    state: 'Michigan',
    rating: 4.4,
    students: 51000,
    image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
    type: 'Public',
  },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeType, setCollegeType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const filteredColleges = mockColleges
    .filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = collegeType === 'all' || college.type.toLowerCase() === collegeType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'students') return b.students - a.students;
      return a.name.localeCompare(b.name);
    });

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
              Discover Your
              <br />
              <span className="text-primary">Dream College</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore top colleges and universities across the country
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphic rounded-2xl p-6 mb-12 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by college name, location, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>

              <Select value={collegeType} onValueChange={setCollegeType}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="College Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-background">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="students">Most Students</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredColleges.length} colleges found</span>
              <Button variant="ghost" size="sm">
                Advanced Filters
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredColleges.map((college, index) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <CollegeCard {...college} />
              </motion.div>
            ))}
          </motion.div>

          {filteredColleges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-xl text-muted-foreground">
                No colleges found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
