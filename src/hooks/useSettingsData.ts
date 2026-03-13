/**
 * @file useSettingsData.ts
 * @description Data-fetching hook for the Settings page — profile, followers,
 *   following counts, and notification group toggles.
 * @module hooks
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, NotificationGroup } from "@/types/settings.types";

/** The 5 notification groups shown on the Notifications tab */
const NOTIFICATION_GROUPS: NotificationGroup[] = [
  { key: 'interactions', categories: ['like', 'comment', 'share', 'mention'], label: 'Interactions', description: 'Likes, commentaires, partages et mentions' },
  { key: 'social', categories: ['follow'], label: 'Social', description: 'Nouvelles abonnements et demandes de suivi' },
  { key: 'messages', categories: ['message'], label: 'Messages', description: 'Messages privés et messages de groupe' },
  { key: 'contenu', categories: ['post', 'lesson', 'word_of_day'], label: 'Contenu', description: 'Nouveaux posts, commentaires de leçons et mot du jour' },
  { key: 'system', categories: ['system'], label: 'Système', description: "Renouvellements d'abonnement et annonces" },
];

export { NOTIFICATION_GROUPS };

interface UseSettingsDataReturn {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  followerCount: number;
  followingCount: number;
  pageLoading: boolean;
  /** Group key → enabled flag, derived from notification_preferences rows */
  groupToggles: Record<string, boolean>;
  setGroupToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  /** Re-fetch all settings data (profile, followers, notification prefs) */
  fetchUserData: () => Promise<void>;
}

/**
 * Centralised data hook for the Settings page.
 * Fetches profile, follower/following counts, and notification preferences in parallel.
 */
export function useSettingsData(
  userId: string | null,
  authLoading: boolean,
): UseSettingsDataReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  // Group-level toggle state: key → enabled (true = all categories in group enabled)
  const [groupToggles, setGroupToggles] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NOTIFICATION_GROUPS.map(g => [g.key, true]))
  );

  // Fetch all data in parallel
  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    setPageLoading(true);

    // Fetch all data in parallel
    const [profileResult, followersResult, followingResult, notificationPrefsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(), // maybeSingle: avoids PGRST116 on race at signup or orphaned auth user
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId).eq("status", "accepted"),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId).eq("status", "accepted"),
      supabase.from("notification_preferences").select("*").eq("user_id", userId),
    ]);

    if (profileResult.error) {
      console.error("Error fetching profile:", profileResult.error);
      setPageLoading(false);
      return;
    }

    const profileData = profileResult.data;
    // Null guard: handles race at signup or orphaned auth user — abort silently rather than crash on .avatar_url
    if (!profileData) {
      setPageLoading(false);
      return;
    }
    setProfile(profileData);

    setFollowerCount(followersResult.count || 0);
    setFollowingCount(followingResult.count || 0);

    // Derive group toggles from real preference rows
    // If ANY category in a group has enabled=false, the group toggle is OFF
    const savedPrefs = notificationPrefsResult.data || [];
    const disabledCategories = new Set(
      savedPrefs.filter(p => p.enabled === false).map(p => p.category)
    );
    const newToggles: Record<string, boolean> = {};
    for (const group of NOTIFICATION_GROUPS) {
      // Group is OFF if any of its categories are explicitly disabled
      newToggles[group.key] = !group.categories.some(cat => disabledCategories.has(cat));
    }
    setGroupToggles(newToggles);

    setPageLoading(false);
  }, [userId]);

  // Trigger fetch when userId becomes available
  useEffect(() => {
    if (userId && !authLoading) {
      fetchUserData();
    }
  }, [userId, authLoading, fetchUserData]);

  return {
    profile,
    setProfile,
    followerCount,
    followingCount,
    pageLoading,
    groupToggles,
    setGroupToggles,
    fetchUserData,
  };
}
