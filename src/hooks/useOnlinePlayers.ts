import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineUserIds, JUDE_USER_ID } from '@/contexts/PresenceContext';

export interface OnlinePlayer {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  academic_grade: string | null;
  isOnline: true;
}

interface UseOnlinePlayersOptions {
  excludeUserId?: string;
  searchQuery?: string;
}

/**
 * Hook to get online players with their profile data.
 * Uses the centralized PresenceContext instead of polling.
 */
export const useOnlinePlayers = ({ excludeUserId, searchQuery }: UseOnlinePlayersOptions = {}) => {
  const onlineUserIds = useOnlineUserIds();
  const [profiles, setProfiles] = useState<Map<string, OnlinePlayer>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Filter online user IDs (exclude current user and Jude)
  const filteredOnlineUserIds = useMemo(() => {
    return Array.from(onlineUserIds).filter(
      id => id !== excludeUserId && id !== JUDE_USER_ID
    );
  }, [onlineUserIds, excludeUserId]);

  // Fetch profiles for online users
  useEffect(() => {
    const fetchProfiles = async () => {
      if (filteredOnlineUserIds.length === 0) {
        setProfiles(new Map());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, avatar_url, academic_grade')
        .in('user_id', filteredOnlineUserIds);

      if (error) {
        console.error('Error fetching online player profiles:', error);
        setIsLoading(false);
        return;
      }

      const profileMap = new Map<string, OnlinePlayer>();
      data?.forEach(profile => {
        profileMap.set(profile.user_id, {
          id: profile.id,
          user_id: profile.user_id,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          academic_grade: profile.academic_grade,
          isOnline: true,
        });
      });

      setProfiles(profileMap);
      setIsLoading(false);
    };

    fetchProfiles();
  }, [filteredOnlineUserIds]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    const players = Array.from(profiles.values());
    
    if (!searchQuery || searchQuery.trim() === '') {
      return players;
    }

    const query = searchQuery.toLowerCase().trim();
    return players.filter(player => 
      player.nickname.toLowerCase().includes(query)
    );
  }, [profiles, searchQuery]);

  const refreshPlayers = useCallback(() => {
    // No-op: PresenceContext handles updates automatically via events
    // Kept for API compatibility
  }, []);

  return {
    players: filteredPlayers,
    totalOnline: profiles.size,
    isLoading,
    refreshPlayers,
  };
};
