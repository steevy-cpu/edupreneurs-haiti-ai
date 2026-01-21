import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVisitor } from "@/contexts/VisitorContext";
import { getAvatarUrl } from "@/lib/avatarMap";
import dashboardImage from "@/assets/dashboard00.png";

export interface CachedUserProfile {
  userId: string | null;
  nickname: string;
  avatarUrl: string;
  academicGrade: string | null;
  isAuthenticated: boolean;
}

const FALLBACK_PROFILE: CachedUserProfile = {
  userId: null,
  nickname: "Visiteur",
  avatarUrl: dashboardImage,
  academicGrade: null,
  isAuthenticated: false,
};

async function fetchUserProfile(): Promise<CachedUserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return FALLBACK_PROFILE;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("avatar_url, nickname, academic_grade")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return {
      ...FALLBACK_PROFILE,
      userId: user.id,
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

  return {
    userId: user.id,
    nickname: profile?.nickname || "Étudiant",
    avatarUrl,
    academicGrade: profile?.academic_grade || null,
    isAuthenticated: true,
  };
}

export function useUserProfile() {
  const { isVisitor } = useVisitor();
  
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes - won't refetch during normal browsing
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Critical: don't refetch on navigation
    enabled: !isVisitor, // Skip fetching for visitors
  });

  // Return visitor fallback when in visitor mode
  if (isVisitor) {
    return {
      profile: FALLBACK_PROFILE,
      isLoading: false,
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
