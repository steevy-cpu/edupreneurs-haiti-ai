import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Dashboard KPI Cards Skeleton
export const DashboardKPISkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-none rounded-xl">
        <CardContent className="p-4 sm:p-6 text-center">
          <Skeleton className="w-12 h-12 rounded-xl mx-auto mb-3" />
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto mb-1" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Subject Card Skeleton
export const SubjectCardSkeleton = () => (
  <Card className="border-none rounded-xl overflow-hidden">
    <CardContent className="p-0">
      <Skeleton className="h-32 w-full" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Subject Grid Skeleton
export const SubjectGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => (
      <SubjectCardSkeleton key={i} />
    ))}
  </div>
);

// Leaderboard Row Skeleton
export const LeaderboardRowSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
    <Skeleton className="w-6 h-6 rounded-full" />
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
    <Skeleton className="h-5 w-12" />
  </div>
);

// Leaderboard Skeleton
export const LeaderboardSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <LeaderboardRowSkeleton key={i} />
    ))}
  </div>
);

// Notification Skeleton
export const NotificationSkeleton = () => (
  <div className="flex items-start gap-4 p-4 border-b border-border">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="w-16 h-3" />
  </div>
);

// Notifications List Skeleton
export const NotificationsListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div>
    {[...Array(count)].map((_, i) => (
      <NotificationSkeleton key={i} />
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = 200 }: { height?: number }) => (
  <Card className="border-none rounded-xl">
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full" style={{ height }} />
    </CardContent>
  </Card>
);

// Hero Section Skeleton for Index page (LCP optimization)
export const HeroSkeleton = () => (
  <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center py-8 px-4">
    <div className="space-y-4">
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-36 rounded-lg" />
        <Skeleton className="h-12 w-36 rounded-lg" />
      </div>
    </div>
    <Skeleton className="h-64 w-64 mx-auto rounded-full" />
  </div>
);

// Auth Form Skeleton for Auth page (3G optimization)
export const AuthFormSkeleton = () => (
  <div className="w-full max-w-md mx-auto p-6 space-y-4">
    <Skeleton className="h-12 w-12 mx-auto rounded-full" />
    <Skeleton className="h-8 w-48 mx-auto" />
    <Skeleton className="h-4 w-64 mx-auto" />
    <div className="space-y-3 pt-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

// Profile Stats Skeleton
export const ProfileStatsSkeleton = () => (
  <div className="flex gap-6 justify-center">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    ))}
  </div>
);

// Note Card Skeleton
export const NoteCardSkeleton = () => (
  <Card className="border-none rounded-xl">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Notes List Skeleton
export const NotesListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <NoteCardSkeleton key={i} />
    ))}
  </div>
);

// Badge Skeleton
export const BadgeSkeleton = () => (
  <div className="flex flex-col items-center p-3 rounded-xl bg-muted/30">
    <Skeleton className="w-12 h-12 rounded-full mb-2" />
    <Skeleton className="h-3 w-16 mb-1" />
    <Skeleton className="h-2 w-20" />
  </div>
);

// Badges Grid Skeleton
export const BadgesGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {[...Array(count)].map((_, i) => (
      <BadgeSkeleton key={i} />
    ))}
  </div>
);

// Conversation List Item Skeleton
export const ConversationItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-lg">
    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-full" />
    </div>
    <Skeleton className="w-10 h-3" />
  </div>
);

// Conversations List Skeleton
export const ConversationsListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-1">
    {[...Array(count)].map((_, i) => (
      <ConversationItemSkeleton key={i} />
    ))}
  </div>
);

// Quick Actions Skeleton
export const QuickActionsSkeleton = () => (
  <Card className="border-none rounded-xl">
    <CardContent className="p-4">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Generic List Item Skeleton
export const ListItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

// Settings Page Skeleton
export const SettingsPageSkeleton = () => (
  <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
    {/* Header Skeleton */}
    <div className="mb-6">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
    
    {/* Tabs Skeleton */}
    <div className="grid w-full grid-cols-4 gap-2 mb-6 p-1 bg-muted rounded-lg">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-md" />
      ))}
    </div>
    
    {/* Profile Overview Card Skeleton */}
    <Card className="border-none rounded-[20px] shadow-md mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-14 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-14 mx-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Form Card Skeleton */}
    <Card className="border-none rounded-[20px] shadow-md">
      <CardHeader className="p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default {
  DashboardKPISkeleton,
  SubjectCardSkeleton,
  SubjectGridSkeleton,
  LeaderboardRowSkeleton,
  LeaderboardSkeleton,
  NotificationSkeleton,
  NotificationsListSkeleton,
  ChartSkeleton,
  HeroSkeleton,
  AuthFormSkeleton,
  ProfileStatsSkeleton,
  NoteCardSkeleton,
  NotesListSkeleton,
  BadgeSkeleton,
  BadgesGridSkeleton,
  ConversationItemSkeleton,
  ConversationsListSkeleton,
  QuickActionsSkeleton,
  ListItemSkeleton,
  SettingsPageSkeleton,
};
