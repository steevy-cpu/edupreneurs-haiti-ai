import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVisitor } from "@/contexts/VisitorContext";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { getAvatarUrl } from "@/lib/avatarMap";
const dashboardImage = '/images/dashboard00-200w.webp';
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  CACHE_KEYS 
} from "@/utils/queryPersistence";

export interface CachedUserProfile {
  userId: string | null;
  nickname: string;
  avatarUrl: string;
  academicGrade: string | null;
  goldEarned: number;
  isAuthenticated: boolean;
}

const FALLBACK_PROFILE: CachedUserProfile = {
  userId: null,
  nickname: "Visiteur",
  avatarUrl: dashboardImage,
  academicGrade: null,
  goldEarned: 0,
  isAuthenticated: false,
};

/**
 * Fetch profile data using provided userId (eliminates redundant getUser() call)
 */
async function fetchUserProfile(userId: string): Promise<CachedUserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("avatar_url, nickname, academic_grade, gold_earned")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    return {
      ...FALLBACK_PROFILE,
      userId,
      isAuthenticated: true,
    };
  }

  // Use getAvatarUrl to properly map avatar IDs to image paths
  let avatarUrl = dashboardImage;
  if (profile?.avatar_url) {
    const mappedUrl = getAvatarUrl(profile.avatar_url);
    if (mappedUrl) {
      avatarUrl = mappedUrl;
    }
  }

  const profileData: CachedUserProfile = {
    userId,
    nickname: profile?.nickname || "Étudiant",
    avatarUrl,
    academicGrade: profile?.academic_grade || null,
    goldEarned: profile?.gold_earned ?? 0,
    isAuthenticated: true,
  };
  
  // Persist to localStorage for instant loading on next visit
  persistQueryData(CACHE_KEYS.USER_PROFILE, profileData);
  
  return profileData;
}

/**
 * Hook to get cached user profile data.
 * Uses SessionAuthContext to get userId, eliminating redundant auth calls.
 */
export function useUserProfile() {
  const { isVisitor } = useVisitor();
  const { user, isLoading: isAuthLoading } = useSessionAuth();
  
  const userId = user?.id || null;
  
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => fetchUserProfile(userId!),
    staleTime: 10 * 60 * 1000, // 10 minutes - won't refetch during normal browsing
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Critical: don't refetch on navigation
    enabled: !!userId && !isVisitor, // Only fetch when we have a userId and not in visitor mode
    // Initialize with persisted data for instant loading
    initialData: () => {
      const cached = getPersistedQueryData<CachedUserProfile>(CACHE_KEYS.USER_PROFILE);
      // Only use cache if it's for the same user
      if (cached && cached.userId === userId) {
        return cached;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.USER_PROFILE),
  });

  // Still loading auth - return fallback to avoid flash
  if (isAuthLoading) {
    return {
      profile: FALLBACK_PROFILE,
      isLoading: true,
      refetch,
    };
  }

  return {
    profile: profile || FALLBACK_PROFILE,
    isLoading,
    refetch,
  };
}

// Helper to invalidate the profile cache (use after avatar/profile updates)
export function useInvalidateUserProfile() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  };
}
