import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Page-specific skeleton components following the "Never Getting Stuck in Loading States" guidelines.
 * These replace the forbidden full-page PageLoader spinner with feature-level skeletons.
 */

// Auth page skeleton - shows form structure immediately
export const AuthSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </CardContent>
    </Card>
  </div>
);

// Community page skeleton - shows chat structure
export const CommunitySkeleton = () => (
  <div className="h-dvh flex flex-col overflow-hidden">
    {/* Header */}
    <div className="border-b p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24 mt-1" />
      </div>
    </div>
    {/* Chat layout */}
    <div className="flex-1 flex">
      {/* Sidebar on desktop */}
      <div className="hidden md:block w-80 border-r p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          </div>
        ))}
      </div>
      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-36'} rounded-2xl`} />
            </div>
          ))}
        </div>
        {/* Input area */}
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Feed page skeleton - shows post structure
export const FeedSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
    {/* Create post */}
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
    </Card>
    {/* Posts */}
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="flex items-center gap-4 pt-2 border-t">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Profile page skeleton
export const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-2xl">
    {/* Profile header */}
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
      <CardContent className="relative pt-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 -mt-12">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
          <div className="flex-1 text-center sm:text-left space-y-2 mt-4 sm:mt-8">
            <Skeleton className="h-6 w-32 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-24 mx-auto sm:mx-0" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Matieres page skeleton - shows subject grid
export const MatieresSkeleton = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="mb-6 space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Notifications page skeleton
export const NotificationsSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
    <Skeleton className="h-8 w-36" />
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </Card>
    ))}
  </div>
);

// Generic page skeleton for less critical pages
export const GenericPageSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </Card>
      ))}
    </div>
  </div>
);

// Course page skeleton
export const CourseSkeleton = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="mb-6">
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-8 w-64" />
    </div>
    <div className="grid gap-3">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);
