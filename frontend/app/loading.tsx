import React from "react";
import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-background z-[9999]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}