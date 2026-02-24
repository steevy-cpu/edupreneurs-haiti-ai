/**
 * useThemeSync — Syncs theme preference between next-themes and the database.
 *
 * On mount: fetches theme_preference from profiles (staleTime: Infinity — once per session).
 * On change: debounces 1s then persists to profiles.theme_preference.
 * Only runs for authenticated users (called inside AppShell).
 */

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useThemeSync() {
  const { theme, setTheme } = useTheme();
  const { user } = useSessionAuth();
  const userId = user?.id;

  // Tracks whether we've applied the DB preference on mount
  const hasAppliedDbPref = useRef(false);
  // Debounce timer ref for saving to DB
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lightweight one-time fetch — staleTime: Infinity means no refetch during session
  const { data: dbTheme } = useQuery({
    queryKey: ['theme-preference', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('user_id', userId!)
        .maybeSingle();
      return (data?.theme_preference as string) ?? 'system';
    },
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // keep in cache for 1 hour
  });

  // Apply DB preference on first load (only once)
  useEffect(() => {
    if (!dbTheme || hasAppliedDbPref.current) return;
    hasAppliedDbPref.current = true;

    // Only override if the DB has a non-default preference that differs
    if (dbTheme !== 'system' && dbTheme !== theme) {
      setTheme(dbTheme);
    }
  }, [dbTheme, theme, setTheme]);

  // Save theme changes to DB with 1s debounce
  useEffect(() => {
    if (!userId || !hasAppliedDbPref.current) return;

    // Clear previous timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      await supabase
        .from('profiles')
        .update({ theme_preference: theme })
        .eq('user_id', userId);
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [theme, userId]);
}
