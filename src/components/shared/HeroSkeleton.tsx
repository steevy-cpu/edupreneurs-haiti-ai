import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

/**
 * Branded loading screen for the homepage.
 * Shows Edupreneurs logo with an Indeed-style progress bar.
 * Optimized for 3G: minimal DOM, preloaded logo, GPU-accelerated animation.
 */
export const HeroSkeleton = () => {
  const [progress, setProgress] = useState(0);

  // Animate progress from 0 to ~90% (feels faster initially, slows down)
  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 300);
    const timer3 = setTimeout(() => setProgress(80), 600);
    const timer4 = setTimeout(() => setProgress(90), 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Logo/Brand */}
      <div className="mb-8">
        <img 
          src="/images/edupreneurs-new-logo.webp" 
          alt="Edupreneurs"
          className="h-16 sm:h-20 w-auto"
          fetchPriority="high"
        />
      </div>
      
      {/* Progress Bar */}
      <div className="w-64 sm:w-80">
        <Progress 
          value={progress} 
          className="h-1 bg-muted"
        />
      </div>
    </div>
  );
};

export default HeroSkeleton;
