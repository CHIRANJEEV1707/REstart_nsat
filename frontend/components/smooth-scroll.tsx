"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function SmoothScroll() {
  // Smooth scrolling with Lenis
  useEffect(() => {
    // Only initialize Lenis in the browser environment
    if (typeof window !== 'undefined') {
      // @ts-ignore - Lenis types are not complete
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        // @ts-ignore - smooth is a valid property but not in the types
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  return null;
}
