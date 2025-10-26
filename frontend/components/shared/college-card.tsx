"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Award } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CollegeCardProps {
  id: string;
  name: string;
  location: string;
  state: string;
  rating: number;
  students: number;
  image: string;
  type: string;
  featured?: boolean;
}

export function CollegeCard({
  id,
  name,
  location,
  state,
  rating,
  students,
  image,
  type,
  featured = false,
}: CollegeCardProps) {
  return (
    <Link href={`/college/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="overflow-hidden h-full hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary/50">
          <div className="relative h-48 overflow-hidden">
            <div
              className="w-full h-full bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {featured && (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-500">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                {type}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 font-[var(--font-space-grotesk)] hover:text-primary transition-colors">
              {name}
            </h3>

            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {location}, {state}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{students.toLocaleString()} students</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-5 pb-5 pt-0">
            <motion.div
              className="w-full text-center py-2 px-4 rounded-lg bg-primary/10 text-primary font-medium text-sm"
              whileHover={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              View Details
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
