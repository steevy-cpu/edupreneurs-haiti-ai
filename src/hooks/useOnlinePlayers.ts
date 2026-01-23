import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

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

export const useOnlinePlayers = ({ excludeUserId, searchQuery }: UseOnlinePlayersOptions = {}) => {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Map<string, OnlinePlayer>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get online users from the shared channel (same pattern as Community.tsx)
  const getOnlineUsers = useCallback(() => {
    const allChannels = supabase.getChannels();
    // Look for the shared 'online-users' presence channel by name or topic
    const onlineChannel = allChannels.find(ch => 
      ch.topic === 'realtime:online-users' || 
      (ch as any).name === 'online-users'
    );
    
    if (onlineChannel) {
      const state = onlineChannel.presenceState();
      const userIds: string[] = [];
      
      // Iterate through all presence keys - the key itself is the user_id
      Object.entries(state).forEach(([key, presences]: [string, any]) => {
        // The key is the user_id (from Layout's presence config)
        if (key && key !== excludeUserId && key !== JUDE_USER_ID) {
          userIds.push(key);
        }
        // Also check inside presence data for user_id field
        if (Array.isArray(presences)) {
          presences.forEach((p: any) => {
            if (p.user_id && p.user_id !== excludeUserId && p.user_id !== JUDE_USER_ID) {
              if (!userIds.includes(p.user_id)) {
                userIds.push(p.user_id);
              }
            }
          });
        }
      });
      
      setOnlineUserIds(prev => {
        // Only update if changed to prevent unnecessary re-renders
        const prevSet = new Set(prev);
        const newSet = new Set(userIds);
        if (prevSet.size !== newSet.size || !userIds.every(id => prevSet.has(id))) {
          return userIds;
        }
        return prev;
      });
    }
  }, [excludeUserId]);

  // Poll the shared channel for online users (same as Community page pattern)
  useEffect(() => {
    // Initial fetch
    getOnlineUsers();

    // Poll every 5 seconds for updates (3G-friendly)
    intervalRef.current = setInterval(getOnlineUsers, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getOnlineUsers]);

  // Fetch profiles for online users
  useEffect(() => {
    const fetchProfiles = async () => {
      if (onlineUserIds.length === 0) {
        setProfiles(new Map());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, avatar_url, academic_grade')
        .in('user_id', onlineUserIds);

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
  }, [onlineUserIds]);

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
    // Simply re-run getOnlineUsers which properly finds the existing channel
    getOnlineUsers();
  }, [getOnlineUsers]);

  return {
    players: filteredPlayers,
    totalOnline: profiles.size,
    isLoading,
    refreshPlayers,
  };
};
