import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for the Index page hero section.
 * Matches the layout structure for smooth transition when content loads.
 */
export const HeroSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
          <Skeleton className="h-8 sm:h-12 w-12 sm:w-16" />
          <div className="hidden lg:flex items-center gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="hidden lg:block h-9 w-24" />
            <Skeleton className="hidden lg:block h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <section className="relative pt-2 pb-6 sm:pt-3 sm:pb-12 lg:pt-4 lg:pb-20 px-2 sm:px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-4 sm:gap-8 lg:gap-10 items-center">
          {/* Left content */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 z-10 px-2">
            {/* Badge */}
            <Skeleton className="h-8 w-48 rounded-full" />
            
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 lg:h-12 w-full max-w-md" />
              <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" />
            </div>
            
            {/* Subtitle */}
            <div className="space-y-2">
              <Skeleton className="h-4 sm:h-5 w-full max-w-lg" />
              <Skeleton className="h-4 sm:h-5 w-5/6" />
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Skeleton className="h-12 sm:h-14 w-full sm:w-48" />
              <Skeleton className="h-12 sm:h-14 w-full sm:w-40" />
            </div>
          </div>

          {/* Right image placeholder */}
          <div className="hidden md:flex justify-center">
            <Skeleton className="w-64 h-64 lg:w-80 lg:h-80 rounded-full" />
          </div>
        </div>
        
        {/* Stats row skeleton */}
        <div className="container mx-auto mt-8 sm:mt-12">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-20 sm:h-20 sm:w-24 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSkeleton;
