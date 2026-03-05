import { memo } from "react";
import { motion } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/**
 * Effect 6: Morphing gradient orbs.
 * Three large blurred divs that slowly drift and pulse,
 * creating an ambient background effect behind all content.
 * Rendered only on desktop with animations enabled.
 */
export const GradientOrbs = memo(function GradientOrbs() {
  const { shouldAnimate } = useAnimationConfig();

  if (!shouldAnimate) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Orb 1: primary color, top-left — slow horizontal drift */}
      <motion.div
        className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full bg-primary/8 blur-3xl"
        animate={{ x: [-50, 50], y: [-30, 30] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      {/* Orb 2: accent color, bottom-right — opposite drift */}
      <motion.div
        className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-accent/8 blur-3xl"
        animate={{ x: [40, -40], y: [20, -40] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
      />
      {/* Orb 3: purple tint, center — scale pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-secondary/5 blur-3xl"
        animate={{ scale: [0.8, 1.2] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
});

export default GradientOrbs;
