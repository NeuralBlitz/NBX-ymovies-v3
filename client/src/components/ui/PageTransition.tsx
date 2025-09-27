import React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PageTransitionProps {
  routeKey: string;
  className?: string;
  children: React.ReactNode;
}

// Subtle, universal page transition: quick fade with a tiny vertical slide
export const PageTransition: React.FC<PageTransitionProps> = ({ routeKey, className, children }) => {
  return (
    <AnimatePresence mode="wait">
      {/* Layout-preserving content wrapper: opacity crossfade only to avoid shifting placeholders */}
      <motion.div
        key={`content-${routeKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 0.8, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>

      {/* Fixed, non-interactive overlay for visible transition without impacting layout */}
      <motion.div
        key={`overlay-${routeKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 0.8, 0.2, 1] }}
        className="pointer-events-none fixed inset-0 z-[40]"
      >
        {/* Radial vignette that fades in/out */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.15)_45%,rgba(0,0,0,0)_70%)]" />
        {/* Soft sweep highlight for a touch of motion */}
        <motion.div
          className="absolute top-0 bottom-0 w-1/3 max-w-[320px] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm"
          initial={{ x: "-35%" }}
          animate={{ x: "135%" }}
          exit={{ x: "135%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
