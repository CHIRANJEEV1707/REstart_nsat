import React from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
      {/* TODO: Add Saved Colleges, Prep Progress, and Framer Motion animations for task bars */}
      <div className="text-muted-foreground">Coming soon: Personalized dashboard with animated progress and saved colleges.</div>
    </motion.div>
  );
}