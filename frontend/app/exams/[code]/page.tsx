import React from "react";
import { motion } from "framer-motion";

export default function ExamDetailPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Exam Details</h1>
      {/* TODO: Add GSAP scroll reveals, exam overview, and motion effects similar to college details */}
      <div className="text-muted-foreground">Coming soon: Dynamic exam details with advanced motion and SSR/SSG.</div>
    </motion.div>
  );
}